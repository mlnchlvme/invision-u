export default function StatusBadge({ status }) {
  const map = {
    pending:  'В ожидании',
    review:   'На рассмотрении',
    approved: 'Принят',
    rejected: 'Отказ',
  };
  return <span className={`badge ${status}`}>{map[status] || status}</span>;
}
