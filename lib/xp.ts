export function levelForXp(xp: number): number {
  // 100 XP per level, starting at level 1
  return Math.floor(xp / 100) + 1;
}

export function xpInCurrentLevel(xp: number): number {
  return xp % 100;
}