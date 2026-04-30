import { Link } from 'react-router-dom';
import { formatDate, formatMoney } from '../orders/orderUtils';
import InvoiceStatusBadge from './InvoiceStatusBadge';

function InvoicesTableSkeleton() { return <div className="orders-skeleton" aria-hidden="true">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="orders-skeleton-row" />)}</div>; }

export default function InvoicesTable({ invoices, loading, onDownload, onPrint }) {
  if (loading) return <InvoicesTableSkeleton />;
  if (!invoices.length) return <div className="orders-empty">No invoices found.</div>;

  return (
    <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Invoice ID</th><th>Customer Name</th><th>Order ID</th><th>Total Amount</th><th>Status</th><th>Issue Date</th><th>Actions</th></tr></thead><tbody>
      {invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.invoiceId}</strong></td><td>{invoice.customerName}</td><td>{invoice.orderId || '-'}</td><td>{formatMoney(invoice.total)}</td><td><InvoiceStatusBadge status={invoice.status} /></td><td className="orders-muted">{formatDate(invoice.issueDate)}</td><td><Link to={`/dashboard/invoices/${invoice.id}`} className="orders-link">View Invoice</Link> | <button type="button" className="orders-link" onClick={() => onDownload(invoice)}> Download PDF </button> | <button type="button" className="orders-link" onClick={() => onPrint(invoice)}> Print Invoice </button></td></tr>)}
    </tbody></table></div>
  );
}