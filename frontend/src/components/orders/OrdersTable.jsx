import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, formatMoney } from './orderUtils';

function OrdersTableSkeleton() {
  return (
    <div className="orders-skeleton" aria-hidden="true">      
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="orders-skeleton-row" />        
      ))}
    </div>
  );
}

export default function OrdersTable({ orders, loading }) {
  if (loading) {
    return <OrdersTableSkeleton />;
  }

  if (!orders.length) {
    return (
      <div className="orders-empty">        
        No orders found. Adjust the filters or search term.
      </div>
    );
  }

  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>        
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Total Price</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>            
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><strong>{order.id}</strong></td>
              <td>{order.customerName}</td>
              <td>{formatMoney(order.totalPrice)}</td>
              <td>{order.paymentMethod}</td>
              <td><StatusBadge status={order.status} /></td>
              <td className="orders-muted">{formatDate(order.createdAt)}</td>
              <td>
                <Link to={`/dashboard/orders/${order.id}`} className="orders-link">                
                  View details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}