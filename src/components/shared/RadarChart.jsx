const KEY_LABELS = {
  leadership:           'Лидерство',
  motivation:           'Мотивация',
  perseverance:         'Настойчивость',
  teamwork:             'Командная работа',
  goal_pursuit:         'Цели',
  intrinsic_motivation: 'Инициатива',
  prosocial_purpose:    'Соц. миссия',
  D: 'Discipline',
  R: 'Responsibility',
  I: 'Insight',
  V: 'Values',
  E: 'Execution',
};

function pt(i, val, n, cx, cy, r) {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  return [cx + r * val * Math.cos(angle), cy + r * val * Math.sin(angle)];
}

function polygon(vals, n, cx, cy, r) {
  return vals.map((v, i) => pt(i, v, n, cx, cy, r).join(',')).join(' ');
}

export default function RadarChart({ data }) {
  if (!data || typeof data !== 'object') return null;

  const entries = Object.entries(data).filter(([, v]) => typeof v === 'number');
  if (entries.length < 3) return null;

  const labels = entries.map(([k]) => KEY_LABELS[k] || k);
  const rawVals = entries.map(([, v]) => v);
  const maxVal  = Math.max(...rawVals);
  const values  = rawVals.map(v => (maxVal > 1 ? v / 10 : v));

  const N = labels.length;
  const cx = 80, cy = 80, r = 58;
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        {rings.map(ring => (
          <polygon
            key={ring}
            points={polygon(Array(N).fill(ring), N, cx, cy, r)}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        {labels.map((_, i) => {
          const [x, y] = pt(i, 1, N, cx, cy, r);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
        })}
        <polygon
          points={polygon(values, N, cx, cy, r)}
          fill="var(--accent)"
          fillOpacity="0.35"
          stroke="var(--accent-dark)"
          strokeWidth="2"
        />
        {values.map((v, i) => {
          const [x, y] = pt(i, v, N, cx, cy, r);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent-dark)" />;
        })}
        {labels.map((lbl, i) => {
          const [x, y] = pt(i, 1.22, N, cx, cy, r);
          return (
            <text
              key={i}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fontFamily="var(--font)"
              fontWeight="700"
              fill="var(--muted)"
            >
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
}