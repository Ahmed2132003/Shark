import { Link } from 'react-router-dom';
import StatusBadge from '../orders/StatusBadge';
import { formatDate, formatMoney } from '../orders/orderUtils';

export default function CustomerOrdersTable({ orders, loading }) {
  if (loading) return <div className="orders-skeleton" aria-hidden="true">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="orders-skeleton-row" />)}</div>;
  if (!orders.length) return <div className="orders-empty">No orders found for this customer.</div>;

  return <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Order ID</th><th>Date</th><th>Status</th><th>Total Price</th><th>Action</th></tr></thead><tbody>
    {orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td className="orders-muted">{formatDate(order.createdAt)}</td><td><StatusBadge status={order.status} /></td><td>{formatMoney(order.totalPrice)}</td><td><Link to={`/dashboard/orders/${order.id}`} className="orders-link">View Order</Link></td></tr>)}
  </tbody></table></div>;
}