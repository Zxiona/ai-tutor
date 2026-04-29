"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

export function NavLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`relative px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-accent ${className}`}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 bg-accent rounded-md -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}