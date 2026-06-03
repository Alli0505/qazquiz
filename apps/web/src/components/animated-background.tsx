"use client";

import { motion } from "framer-motion";

/**
 * Bright, playful, game-flavoured backdrop:
 *  - a flowing "aurora" gradient base (the brightness driver)
 *  - drifting + pulsing color glows
 *  - the quiz answer shapes (▲ ◆ ● ■) rising and tumbling like confetti
 *
 * Deterministic (no Math.random → no hydration mismatch), transform/opacity
 * only (GPU-friendly), behind content, and respects prefers-reduced-motion.
 */

// Kazakh-inspired joyful palette: flag sky-blue (kök) + gold (the sun),
// warmed with an ornament red and a bright teal.
const KZ_BLUE = "#00AFCA";
const KZ_GOLD = "#FFC93C";
const KZ_RED = "#E8552D";
const KZ_TEAL = "#1FB6A6";

const SHAPES = [
  { sym: "▲", color: KZ_GOLD },
  { sym: "◆", color: KZ_BLUE },
  { sym: "●", color: KZ_RED },
  { sym: "■", color: KZ_TEAL },
];

const COUNT = 22;

// Deterministic pseudo-spread using coprime multipliers so the floaters
// look scattered without any randomness.
const FLOATERS = Array.from({ length: COUNT }, (_, i) => {
  const shape = SHAPES[i % SHAPES.length]!;
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    ...shape,
    left: (i * 61 + 7) % 100, // 0–99 vw
    size: 18 + ((i * 17) % 46), // 18–64 px
    duration: 15 + ((i * 7) % 17), // 15–32 s
    delay: (i * 1.3) % 13, // staggered start
    sway: 26 + ((i * 11) % 48), // horizontal drift px
    spin: 180 * dir + dir * ((i * 23) % 200), // rotation amount
  };
});

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* flowing aurora base — keeps the whole scene bright */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: 0.5,
          backgroundImage: `linear-gradient(120deg, ${KZ_BLUE}, ${KZ_TEAL}, ${KZ_GOLD}, ${KZ_RED}, ${KZ_BLUE})`,
          backgroundSize: "300% 300%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* slowly rotating conic shimmer for extra life */}
      <motion.div
        className="absolute inset-[-45%] rounded-full blur-3xl"
        style={{
          opacity: 0.3,
          background: `conic-gradient(from 0deg, ${KZ_BLUE}, ${KZ_GOLD}, ${KZ_RED}, ${KZ_TEAL}, ${KZ_BLUE})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* drifting + pulsing glows */}
      <motion.div
        className="absolute h-[40vmax] w-[40vmax] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
        initial={{ left: "-10%", top: "-6%" }}
        animate={{
          left: ["-10%", "8%", "-10%"],
          top: ["-6%", "12%", "-6%"],
          scale: [1, 1.25, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[36vmax] w-[36vmax] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(255,201,60,0.5)" }}
        initial={{ right: "-8%", bottom: "-8%" }}
        animate={{
          right: ["-8%", "10%", "-8%"],
          bottom: ["-8%", "8%", "-8%"],
          scale: [1.1, 0.85, 1.1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[30vmax] w-[30vmax] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(0,175,202,0.5)" }}
        initial={{ left: "55%", top: "45%" }}
        animate={{
          left: ["55%", "40%", "60%", "55%"],
          top: ["45%", "60%", "35%", "45%"],
          scale: [0.9, 1.2, 0.9],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating quiz shapes */}
      <div className="absolute inset-0 motion-reduce:hidden">
        {FLOATERS.map((f, i) => (
          <motion.span
            key={i}
            className="absolute select-none font-black drop-shadow-lg"
            style={{
              left: `${f.left}%`,
              top: "100%",
              fontSize: f.size,
              color: f.color,
            }}
            initial={{ y: "0vh", opacity: 0 }}
            animate={{
              y: ["0vh", "-120vh"],
              x: [0, f.sway, -f.sway, 0],
              rotate: [0, f.spin],
              scale: [0.8, 1.15, 0.9, 1],
              opacity: [0, 0.85, 0.85, 0],
            }}
            transition={{
              duration: f.duration,
              delay: f.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {f.sym}
          </motion.span>
        ))}
      </div>

      {/* very light vignette — just enough to keep foreground text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(255,255,255,0.2)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_65%,rgba(9,9,11,0.3)_100%)]" />
    </div>
  );
}
