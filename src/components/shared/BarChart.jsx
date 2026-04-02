export default function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div
            key={i}
            className="bar"
            style={{
              height: `${(d.v / max) * 100}%`,
              background: d.color || 'var(--accent)',
              opacity: d.color ? 1 : 0.75,
            }}
          >
            <span className="bar-val">{d.v}</span>
          </div>
        ))}
      </div>
      <div className="bar-labels">
        {data.map((d, i) => (
          <div key={i} className="bar-label">{d.l}</div>
        ))}
      </div>
    </div>
  );
}
