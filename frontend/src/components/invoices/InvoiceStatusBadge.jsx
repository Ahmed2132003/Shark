export default function InvoiceStatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  const className = normalized === 'paid' ? 'status-badge--delivered' : normalized === 'cancelled' ? 'status-badge--cancelled' : 'status-badge--pending';
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return <span className={`status-badge ${className}`}>{label}</span>;
}