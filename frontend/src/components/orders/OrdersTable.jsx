import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ORDER_STATUSES } from '../../hooks/useOrders';
import { formatDate, formatMoney } from './orderUtils';

function OrdersTableSkeleton() { return <div className="orders-skeleton" aria-hidden="true">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="orders-skeleton-row" />)}</div>; }

export default function OrdersTable({ orders, loading, onDelete, onUpdateStatus, onAddNote, activeAction }) {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const openNoteEditor = (order) => {
    setExpandedRowId((current) => (current === order.id ? null : order.id));
    setNoteValue('');
  };

  if (loading) return <OrdersTableSkeleton />;
  if (!orders.length) return <div className="orders-empty">No orders found. Adjust the filters or search term.</div>;
  return (
    <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Order ID</th><th>Customer Name</th><th>Total Price</th><th>Status</th><th>Created At</th><th>Actions</th></tr></thead><tbody>
      {orders.map((order) => {
        const busy = activeAction?.orderId === order.id;
        const isNoteOpen = expandedRowId === order.id;
        const isDeleteConfirming = confirmDeleteId === order.id;
        return (
          <Fragment key={order.id}>
            <tr><td><strong>{order.id}</strong></td><td>{order.customerName}</td><td>{formatMoney(order.totalPrice)}</td><td><StatusBadge status={order.status} /></td><td className="orders-muted">{formatDate(order.createdAt)}</td><td>
              <div className="orders-actions" role="group" aria-label={`Actions for order ${order.id}`}>
                <Link to={`/dashboard/orders/${order.id}`} className="orders-btn orders-btn--table">View</Link>
                <select
                  className="orders-select orders-select--table"
                  value={order.status}
                  onChange={(event) => onUpdateStatus(order, event.target.value)}
                  aria-label={`Update status for order ${order.id}`}
                  disabled={busy}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button type="button" className="orders-btn orders-btn--table orders-btn--secondary" onClick={() => openNoteEditor(order)} aria-label={`Add note to order ${order.id}`} disabled={busy}>{activeAction?.type === 'note' && busy ? 'Saving...' : isNoteOpen ? 'Close Note' : 'Note'}</button>
                {isDeleteConfirming ? (
                  <div className="orders-inline-confirm">
                    <button type="button" className="orders-btn orders-btn--table orders-btn--danger" onClick={() => onDelete(order)} disabled={busy}>{activeAction?.type === 'delete' && busy ? 'Deleting...' : 'Yes, Delete'}</button>
                    <button type="button" className="orders-btn orders-btn--table" onClick={() => setConfirmDeleteId(null)} disabled={busy}>Cancel</button>
                  </div>
                ) : (
                  <button type="button" className="orders-btn orders-btn--table orders-btn--danger" onClick={() => setConfirmDeleteId(order.id)} aria-label={`Delete order ${order.id}`} disabled={busy}>Delete</button>
                )}
              </div>
            </td></tr>
            {isNoteOpen && (
              <tr className="orders-inline-row">
                <td colSpan={6}>
                  <div className="orders-inline-panel">
                    <textarea
                      className="orders-input orders-textarea"
                      value={noteValue}
                      onChange={(event) => setNoteValue(event.target.value)}
                      rows={2}
                      placeholder="Add admin note"
                    />
                    <div className="orders-inline-panel__actions">
                      <button
                        type="button"
                        className="orders-btn orders-btn--table orders-btn--primary"
                        onClick={() => onAddNote(order, noteValue)}
                        disabled={busy || !noteValue.trim()}
                      >
                        {activeAction?.type === 'note' && busy ? 'Saving...' : 'Save Note'}
                      </button>
                      <button type="button" className="orders-btn orders-btn--table" onClick={() => setExpandedRowId(null)} disabled={busy}>Cancel</button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </tbody></table></div>
  );
}