import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderDetailsSkeleton from '../../components/orders/OrderDetailsSkeleton';
import OrderStatusSelect from '../../components/orders/OrderStatusSelect';
import OrderTimeline from '../../components/orders/OrderTimeline';
import StatusBadge from '../../components/orders/StatusBadge';
import { formatDate, formatMoney } from '../../components/orders/orderUtils';
import { useOrder, useUpdateOrderStatus } from '../../hooks/useOrders';
import './orders.css';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [feedback, setFeedback] = useState(null);

  const handleStatusChange = async (status) => {
    setFeedback(null);

    try {
      await updateStatus.mutateAsync({ orderId: id, status });
      setFeedback({ type: 'success', message: 'Order status updated successfully.' });
    } catch (mutationError) {
      setFeedback({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Unable to update status.',
      });
    }
  };

  return (
    <section className="orders-page">
      <header className="orders-page__header">
        <div>
          <h1 className="orders-page__title">Order Details</h1>
          <p className="orders-page__subtitle">Review customer data, products, and fulfillment status.</p>
        </div>
        <Link to="/dashboard/orders" className="orders-btn">Back to orders</Link>
      </header>

      {isLoading && <OrderDetailsSkeleton />}

      {isError && (
        <div className="orders-error" role="alert">
          <p>{error instanceof Error ? error.message : 'Unable to load this order.'}</p>
          <button type="button" onClick={() => refetch()} className="orders-btn">Retry</button>
        </div>
      )}

      {!isLoading && !isError && order && (
        <div className="orders-details-grid">
          <div className="orders-stack">
            <article className="orders-card">
              <div className="orders-row-between">
                <p className="orders-id-label">{order.id}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="orders-muted">Created {formatDate(order.createdAt)}</p>
              <p className="orders-subline">Payment method: {order.paymentMethod}</p>
            </article>

            <article className="orders-card">
              <h2 className="orders-section-title">Customer Information</h2>
              <div className="orders-info-grid">
                <p><span className="orders-muted">Name:</span> {order.customer?.name || order.customerName}</p>
                <p><span className="orders-muted">Email:</span> {order.customer?.email || '-'}</p>
                <p><span className="orders-muted">Phone:</span> {order.customer?.phone || '-'}</p>
                <p><span className="orders-muted">Address:</span> {order.customer?.address || '-'}</p>
              </div>
            </article>

            <article className="orders-card">
              <h2 className="orders-section-title">Products</h2>
              <div className="orders-products-list">
                {(order.products || []).map((product) => (
                  <div key={product.id} className="orders-product-item">
                    <img src={product.image} alt={product.name} className="orders-product-image" />
                    <div className="orders-product-meta">
                      <p className="orders-id-label">{product.name}</p>
                      <p className="orders-muted">Qty: {product.quantity}</p>
                    </div>
                    <p className="orders-id-label">{formatMoney(product.price)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="orders-card">
              <OrderTimeline status={order.status} />
            </article>
          </div>

          <aside className="orders-stack">
            <article className="orders-card">
              <h2 className="orders-section-title">Status Management</h2>
              <div className="orders-status-select-wrap">
                <OrderStatusSelect value={order.status} loading={updateStatus.isPending} onChange={handleStatusChange} />
              </div>

              {feedback && (
                <p className={`orders-feedback orders-feedback--${feedback.type}`} role="status">
                  {feedback.message}
                </p>
              )}
            </article>

            <article className="orders-card">
              <h2 className="orders-section-title">Price Breakdown</h2>
              <div className="orders-price-grid">
                <div className="orders-row-between"><span className="orders-muted">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
                <div className="orders-row-between"><span className="orders-muted">Shipping</span><span>{formatMoney(order.shipping)}</span></div>
                <div className="orders-row-between"><span className="orders-muted">Tax</span><span>{formatMoney(order.tax)}</span></div>
                <div className="orders-row-between"><span className="orders-muted">Discount</span><span>-{formatMoney(order.discount)}</span></div>
                <hr className="orders-divider" />
                <div className="orders-row-between orders-row-between--strong"><span>Total</span><span>{formatMoney(order.totalPrice)}</span></div>
              </div>
            </article>
          </aside>
        </div>
      )}
    </section>
  );
}