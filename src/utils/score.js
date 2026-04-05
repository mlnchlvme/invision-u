export function displayScore(raw) {
  if (raw == null) return '—';
  const normalized = Math.round(raw * 10 * 10) / 10; // 9.21 → 92.1
  return String(normalized);
}

export function scoreColor(raw) {
  if (raw == null) return 'var(--muted)';
  const n = raw * 10;
  if (n >= 80) return 'var(--green)';
  if (n >= 60) return 'var(--text)';
  return 'var(--red)';
}

export function scoreZone(raw) {
  if (raw == null) return '—';
  if (raw >= 8.5) return 'A';
  if (raw >= 6.5) return 'B';
  return 'C';
}