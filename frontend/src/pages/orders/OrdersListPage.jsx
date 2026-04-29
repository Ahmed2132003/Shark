import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import OrderFilters from '../../components/orders/OrderFilters';
import OrdersPagination from '../../components/orders/OrdersPagination';
import OrdersTable from '../../components/orders/OrdersTable';
import './orders.css';

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  sortBy: 'dateDesc',
  page: 1,
  pageSize: 8,
};

export default function OrdersListPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const queryFilters = useMemo(() => filters, [filters]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrders(queryFilters);

  return (
    <section className="orders-page">
      <header className="orders-page__header">
        <div>
          <h1 className="orders-page__title">Orders Management</h1>
          <p className="orders-page__subtitle">Search, filter, and monitor all order activity.</p>
        </div>
        <Link to="/dashboard" className="orders-btn">Back to dashboard</Link>
      </header>

      <div className="orders-surface">
        <OrderFilters filters={filters} onChange={setFilters} />
      </div>

      {isFetching && !isLoading && <p className="orders-refresh">Refreshing orders...</p>}

      {isError ? (
        <div className="orders-error" role="alert">
          <p>{error instanceof Error ? error.message : 'Unable to load orders.'}</p>
          <button type="button" onClick={() => refetch()} className="orders-btn">
            Retry
          </button>
        </div>
      ) : (
        <div className="orders-surface">
          <OrdersTable orders={data?.items || []} loading={isLoading} />
          <OrdersPagination
            page={filters.page}
            total={data?.total || 0}
            pageSize={filters.pageSize}
            onPageChange={(nextPage) => setFilters((previous) => ({ ...previous, page: Math.max(1, nextPage) }))}
          />
        </div>
      )}
    </section>
  );
}