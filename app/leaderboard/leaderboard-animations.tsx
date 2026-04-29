"use client";

import { motion } from "motion/react";

export default function LeaderboardAnimations({
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
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className="space-y-2"
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}