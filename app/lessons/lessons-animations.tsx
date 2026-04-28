"use client";

import { motion } from "motion/react";

export default function LessonsAnimations({
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
        visible: { transition: { staggerChildren: 0.05 } },
      }}
      className="space-y-3"
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, x: -16 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}