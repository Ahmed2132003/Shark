export const statusClasses = {
  pending: 'status-badge--pending',
  processing: 'status-badge--processing',
  shipped: 'status-badge--shipped',
  delivered: 'status-badge--delivered',
  cancelled: 'status-badge--cancelled',  
};

export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function humanizeStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}