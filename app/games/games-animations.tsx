"use client";

import { motion } from "motion/react";

export default function GamesAnimations({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="grid md:grid-cols-2 gap-4"
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}