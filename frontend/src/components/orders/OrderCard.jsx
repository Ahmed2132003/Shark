import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, formatMoney } from './orderUtils';

export default function OrderCard({ order }) {
  return (
    <article className="orders-card">
      <div className="orders-row-between">
        <p className="orders-id-label">#{order.id}</p>
        <StatusBadge status={order.status} />
      </div>
      <div className="orders-info-grid" style={{ marginTop: 10 }}>
        <p><span className="orders-muted">Order Date:</span> {formatDate(order.createdAt)}</p>
        <p><span className="orders-muted">Total Price:</span> {formatMoney(order.totalPrice)}</p>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link to={`/track-order/${order.id}`} className="orders-btn orders-btn--primary">Track Order</Link>
      </div>
    </article>
  );
}