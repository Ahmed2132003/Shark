import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreateOrder, useDeleteOrder, useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import OrderFilters from '../../components/orders/OrderFilters';
import OrdersPagination from '../../components/orders/OrdersPagination';
import OrdersTable from '../../components/orders/OrdersTable';
import './orders.css';

const DEFAULT_FILTERS = { search: '', status: 'all', sortBy: 'dateDesc', dateFrom: '', dateTo: '', page: 1, pageSize: 8 };

export default function OrdersListPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const queryFilters = useMemo(() => filters, [filters]);
  const { data, isLoading, isError, error, refetch, isFetching } = useOrders(queryFilters);
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();

  const handleDelete = async (order) => { if (!window.confirm(`Delete order #${order.id}?`)) return; await deleteOrder.mutateAsync(order.id); };
  const handleStatus = async (order) => { const status = window.prompt('Enter status: pending/confirmed/shipped/delivered/cancelled', order.status); if (!status) return; await updateStatus.mutateAsync({ orderId: order.id, status }); };
  const handleNote = async (order) => { const note = window.prompt('Add admin note'); if (!note) return; await updateStatus.mutateAsync({ orderId: order.id, status: order.status, note }); };
  const handleCreate = async () => {
    const shipping_name = window.prompt('Customer name'); if (!shipping_name) return;
    const shipping_phone = window.prompt('Customer phone', '');
    const shipping_address = window.prompt('Shipping address', '');
    const variant_id = Number(window.prompt('Variant ID for product item'));
    const quantity = Number(window.prompt('Quantity', '1'));
    const tax = Number(window.prompt('Tax', '0'));
    const shipping = Number(window.prompt('Shipping', '0'));
    const discount = Number(window.prompt('Discount', '0'));
    await createOrder.mutateAsync({ shipping_name, shipping_phone, shipping_address, status: 'pending', notes: '', tax, shipping, discount, items: [{ variant_id, quantity }] });
  };

  return (<section className="orders-page"><header className="orders-page__header"><div><h1 className="orders-page__title">Orders Management</h1><p className="orders-page__subtitle">Search, filter, and monitor all order activity.</p></div><div style={{display:'flex',gap:12}}><button type="button" className="orders-btn" onClick={handleCreate}>New Order</button><Link to="/dashboard" className="orders-btn">Back to dashboard</Link></div></header>
    <div className="orders-surface"><OrderFilters filters={filters} onChange={setFilters} /></div>
    {isFetching && !isLoading && <p className="orders-refresh">Refreshing orders...</p>}
    {isError ? <div className="orders-error" role="alert"><p>{error instanceof Error ? error.message : 'Unable to load orders.'}</p><button type="button" onClick={() => refetch()} className="orders-btn">Retry</button></div> : <div className="orders-surface"><OrdersTable orders={data?.items || []} loading={isLoading} onDelete={handleDelete} onUpdateStatus={handleStatus} onAddNote={handleNote} /><OrdersPagination page={filters.page} total={data?.total || 0} pageSize={filters.pageSize} onPageChange={(nextPage) => setFilters((previous) => ({ ...previous, page: Math.max(1, nextPage) }))} /></div>}
  </section>);
}