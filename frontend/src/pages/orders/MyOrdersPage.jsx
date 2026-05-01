import { Link } from 'react-router-dom';
import { useMyOrders } from '../../hooks/useOrders';
import OrderCard from '../../components/orders/OrderCard';
import './orders.css';

export default function MyOrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useMyOrders();

  return (
    <section className="orders-page">
      <header className="orders-page__header">
        <div>
          <h1 className="orders-page__title">My Orders</h1>
          <p className="orders-page__subtitle">Review your order history and track delivery updates.</p>
        </div>
      </header>

      {isLoading && (
        <div className="orders-skeleton" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="orders-skeleton-row" />
          ))}
        </div>
      )}

      {isError && (
        <div className="orders-error" role="alert">
          <p>{error instanceof Error ? error.message : 'Unable to load your orders right now.'}</p>
          <button type="button" onClick={() => refetch()} className="orders-btn">Retry</button>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <article className="orders-empty">
          <p>You have no orders yet</p>
          <Link to="/products" className="orders-btn orders-btn--primary" style={{ marginTop: 12 }}>
            Start Shopping
          </Link>
        </article>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="orders-details-grid">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}