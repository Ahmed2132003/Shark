const STATUS_CONFIG = {
  draft: { className: 'status-badge--pending', label: 'Draft' },
  processing: { className: 'status-badge--processing', label: 'Processing' },
  sent: { className: 'status-badge--processing', label: 'Sent' },
  paid: { className: 'status-badge--delivered', label: 'Paid' },
  cancelled: { className: 'status-badge--cancelled', label: 'Cancelled' },
};

export default function InvoiceStatusBadge({ status }) {
  const normalized = (status || 'draft').toLowerCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.draft;
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}