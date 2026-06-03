"use client";

import { motion } from "framer-motion";

/**
 * Bright, playful, game-flavoured backdrop — tuned for smoothness:
 * only `transform` and `opacity` are animated (GPU-composited, no layout
 * or paint per frame). The bright aurora base is static.
 *
 * Deterministic (no Math.random → no hydration mismatch), behind content,
 * and respects prefers-reduced-motion.
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

const COUNT = 14;

// Deterministic pseudo-spread using coprime multipliers so the floaters
// look scattered without any randomness.
const FLOATERS = Array.from({ length: COUNT }, (_, i) => {
  const shape = SHAPES[i % SHAPES.length]!;
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    ...shape,
    left: (i * 71 + 5) % 100, // 0–99 vw
    size: 20 + ((i * 17) % 42), // 20–62 px
    duration: 16 + ((i * 5) % 12), // 16–28 s
    delay: (i * 1.9) % 12, // staggered start
    sway: 24 + ((i * 11) % 40), // horizontal drift px
    spin: 180 * dir, // half-turn either way
  };
});

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* static bright aurora base — full-cover, zero animation cost */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.55,
          backgroundImage: `linear-gradient(120deg, ${KZ_BLUE}, ${KZ_TEAL}, ${KZ_GOLD}, ${KZ_RED})`,
        }}
      />

      {/* drifting glows — transform + opacity only (GPU-composited) */}
      <motion.div
        className="absolute h-[38vmax] w-[38vmax] rounded-full blur-2xl"
        style={{ left: "-8%", top: "-6%", backgroundColor: "rgba(0,175,202,0.4)" }}
        animate={{ x: [0, 90, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[34vmax] w-[34vmax] rounded-full blur-2xl"
        style={{ right: "-6%", bottom: "-6%", backgroundColor: "rgba(255,201,60,0.42)" }}
        animate={{ x: [0, -80, 0], y: [0, -55, 0], scale: [1.1, 0.9, 1.1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating quiz shapes — transform + opacity only */}
      <div className="absolute inset-0 motion-reduce:hidden">
        {FLOATERS.map((f, i) => (
          <motion.span
            key={i}
            className="absolute select-none font-black"
            style={{
              left: `${f.left}%`,
              top: "100%",
              fontSize: f.size,
              color: f.color,
              willChange: "transform, opacity",
            }}
            initial={{ y: "0vh", opacity: 0 }}
            animate={{
              y: ["0vh", "-120vh"],
              x: [0, f.sway, -f.sway, 0],
              rotate: [0, f.spin],
              opacity: [0, 0.8, 0.8, 0],
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

      {/* very light vignette — keeps foreground text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(255,255,255,0.2)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_65%,rgba(9,9,11,0.3)_100%)]" />
    </div>
  );
}
