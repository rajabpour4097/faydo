const LEVELS = [
  { name: 'برنزی', threshold: 0 },
  { name: 'نقره‌ای', threshold: 200 },
  { name: 'طلایی', threshold: 500 },
  { name: 'VIP', threshold: 900 }
];

export function levelFromPoints(points) {
  return LEVELS.reduce((acc, lvl) => (points >= lvl.threshold ? lvl : acc), LEVELS[0]);
}

export function nextLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].threshold) {
      return LEVELS[i + 1] || null;
    }
  }
  return LEVELS[0];
}

export function progressToNextLevel(points) {
  const current = levelFromPoints(points);
  const next = nextLevel(points);
  if (!next) return { percent: 100, remaining: 0 };
  const span = next.threshold - current.threshold;
  const done = points - current.threshold;
  return { percent: Math.min(100, Math.round((done / span) * 100)), remaining: next.threshold - points };
}

export { LEVELS };
