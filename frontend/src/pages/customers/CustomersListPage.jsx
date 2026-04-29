import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomersTable from '../../components/customers/CustomersTable';
import OrdersPagination from '../../components/orders/OrdersPagination';
import { useCustomers } from '../../hooks/useCustomers';
import '../orders/orders.css';

const DEFAULT_FILTERS = { search: '', page: 1, pageSize: 8 };

export default function CustomersListPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const queryFilters = useMemo(() => filters, [filters]);
  const { data, isLoading, isError, error, isFetching, refetch } = useCustomers(queryFilters);

  return (
    <section className="orders-page">
      <header className="orders-page__header">
        <div><h1 className="orders-page__title">Customers Management</h1><p className="orders-page__subtitle">Search and review your customer base.</p></div>
        <div style={{ display: 'flex', gap: 12 }}><Link to="/dashboard/orders" className="orders-btn">Orders</Link><Link to="/dashboard" className="orders-btn">Back to dashboard</Link></div>
      </header>

      <div className="orders-surface"><div className="orders-filters"><input type="search" value={filters.search} onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value, page: 1 }))} className="orders-input" placeholder="Search by name, email, or phone" /></div></div>
      {isFetching && !isLoading && <p className="orders-refresh">Refreshing customers...</p>}
      {isError ? <div className="orders-error" role="alert"><p>{error instanceof Error ? error.message : 'Unable to load customers.'}</p><button type="button" onClick={() => refetch()} className="orders-btn">Retry</button></div> : <div className="orders-surface"><CustomersTable customers={data?.items || []} loading={isLoading} /><OrdersPagination page={filters.page} total={data?.total || 0} pageSize={filters.pageSize} onPageChange={(nextPage) => setFilters((previous) => ({ ...previous, page: Math.max(1, nextPage) }))} /></div>}
    </section>
  );
}