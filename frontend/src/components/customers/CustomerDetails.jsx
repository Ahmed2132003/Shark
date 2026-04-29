import { formatDate } from '../orders/orderUtils';

export default function CustomerDetails({ customer }) {
  return (
    <article className="orders-card">
      <h2 className="orders-section-title">Customer Information</h2>
      <div className="orders-info-grid">
        <p><span className="orders-muted">Full Name:</span> {customer.fullName}</p>
        <p><span className="orders-muted">Email:</span> {customer.email || '-'}</p>
        <p><span className="orders-muted">Phone:</span> {customer.phone || '-'}</p>
        <p><span className="orders-muted">Address:</span> {customer.address || '-'}</p>
        <p><span className="orders-muted">Registration Date:</span> {formatDate(customer.createdAt)}</p>
      </div>
    </article>
  );
}