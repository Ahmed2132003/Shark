import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomerDetails from '../../components/customers/CustomerDetails';
import CustomerStats from '../../components/customers/CustomerStats';
import CustomerOrdersTable from '../../components/customers/CustomerOrdersTable';
import { useCustomer } from '../../hooks/useCustomers';
import '../orders/orders.css';

export default function CustomerDetailsPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const tr = (en, ar) => (isRTL ? ar : en);

  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useCustomer(id);

  return (
    <section className="orders-page">
      <header className="orders-page__header"><div><h1 className="orders-page__title">Customer Details</h1><p className="orders-page__subtitle">View profile data, stats, and full order history.</p></div><Link to="/dashboard/customers" className="orders-btn">Back to customers</Link></header>
      {isError && <div className="orders-error" role="alert"><p>{error instanceof Error ? error.message : 'Unable to load customer details.'}</p><button type="button" onClick={() => refetch()} className="orders-btn">{tr('Retry', 'إعادة المحاولة')}</button></div>}
      {!isError && <div className="orders-stack"><CustomerDetails customer={data?.customer || {}} /><CustomerStats totalOrders={data?.totalOrders || 0} totalSpent={data?.totalSpent || 0} lastOrderDate={data?.lastOrderDate} /><article className="orders-card"><h2 className="orders-section-title">Order History</h2><div style={{ marginTop: 12 }}><CustomerOrdersTable orders={data?.orders || []} loading={isLoading} /></div></article></div>}
    </section>
  );
}