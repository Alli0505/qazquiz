"use client";

import { motion } from "framer-motion";

/**
 * Playful, game-flavoured backdrop:
 *  - two slow gradient glows for depth
 *  - the quiz answer shapes (▲ ◆ ● ■) drifting upward and tumbling like
 *    confetti, in the same four colors as the in-game answer buttons
 *
 * Everything is deterministic (no Math.random → no hydration mismatch),
 * transform/opacity only (GPU-friendly), behind content, and respects
 * `prefers-reduced-motion`.
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

const COUNT = 18;

// Deterministic pseudo-spread using coprime multipliers so the floaters
// look scattered without any randomness.
const FLOATERS = Array.from({ length: COUNT }, (_, i) => {
  const shape = SHAPES[i % SHAPES.length]!;
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    ...shape,
    left: (i * 61 + 7) % 100, // 0–99 vw
    size: 16 + ((i * 17) % 44), // 16–60 px
    duration: 16 + ((i * 7) % 18), // 16–34 s
    delay: (i * 1.7) % 14, // staggered start
    sway: 24 + ((i * 11) % 46), // horizontal drift px
    spin: 180 * dir + dir * ((i * 23) % 180), // rotation amount
  };
});

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* soft depth glows — kök blue + gold */}
      <motion.div
        className="absolute h-[42vmax] w-[42vmax] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(0,175,202,0.26)" }}
        initial={{ left: "-12%", top: "-8%" }}
        animate={{ left: ["-12%", "6%", "-12%"], top: ["-8%", "10%", "-8%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[38vmax] w-[38vmax] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(255,201,60,0.22)" }}
        initial={{ right: "-10%", bottom: "-10%" }}
        animate={{
          right: ["-10%", "8%", "-10%"],
          bottom: ["-10%", "6%", "-10%"],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating quiz shapes */}
      <div className="absolute inset-0 motion-reduce:hidden">
        {FLOATERS.map((f, i) => (
          <motion.span
            key={i}
            className="absolute select-none font-black drop-shadow-md"
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
              opacity: [0, 0.5, 0.5, 0],
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

      {/* gentle vignette to keep foreground text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.55)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(9,9,11,0.7)_100%)]" />
    </div>
  );
}
