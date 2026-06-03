"use client";

import { motion } from "framer-motion";

/**
 * Decorative drifting gradient blobs behind all content. Pure transform
 * animations (GPU-friendly), pointer-events: none, sits at z-[-10].
 */
const BLOBS = [
  {
    className: "bg-indigo-500/40",
    size: 420,
    from: { x: "-10%", y: "0%" },
    to: { x: "10%", y: "12%" },
    duration: 18,
  },
  {
    className: "bg-fuchsia-500/40",
    size: 480,
    from: { x: "70%", y: "10%" },
    to: { x: "55%", y: "-8%" },
    duration: 22,
  },
  {
    className: "bg-sky-500/30",
    size: 360,
    from: { x: "20%", y: "70%" },
    to: { x: "40%", y: "85%" },
    duration: 26,
  },
];

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.className}`}
          style={{ width: b.size, height: b.size }}
          initial={{ left: b.from.x, top: b.from.y, scale: 1 }}
          animate={{
            left: [b.from.x, b.to.x, b.from.x],
            top: [b.from.y, b.to.y, b.from.y],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* subtle grid wash for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--tw-bg-overlay,rgba(255,255,255,0.4))_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.6)_100%)]" />
    </div>
  );
}
