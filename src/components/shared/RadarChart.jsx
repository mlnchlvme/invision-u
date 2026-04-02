const labels = ['Лидерство', 'Мотивация', 'Коммуникация', 'Аналитика', 'Инициатива'];
const values = [0.7, 0.8, 0.9, 0.7, 0.75];
const N = labels.length;
const cx = 80, cy = 80, r = 60;

function pt(i, val) {
  const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
  return [cx + r * val * Math.cos(angle), cy + r * val * Math.sin(angle)];
}

function polygon(vals) {
  return vals.map((v, i) => pt(i, v).join(',')).join(' ');
}

export default function RadarChart() {
  const rings = [0.25, 0.5, 0.75, 1];
  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        {/* Grid rings */}
        {rings.map(ring => (
          <polygon
            key={ring}
            points={polygon(Array(N).fill(ring))}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        {/* Axes */}
        {labels.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon
          points={polygon(values)}
          fill="var(--accent)"
          fillOpacity="0.35"
          stroke="var(--accent-dark)"
          strokeWidth="2"
        />
        {/* Data points */}
        {values.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent-dark)" />;
        })}
        {/* Labels */}
        {labels.map((lbl, i) => {
          const [x, y] = pt(i, 1.18);
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
