import { Link } from 'react-router-dom';
import InvoicesTable from '../../components/invoices/InvoicesTable';
import { useInvoices } from '../../hooks/useInvoices';
import { downloadInvoicePdf, printInvoice } from '../../components/invoices/invoicePrint';
import '../orders/orders.css';

export default function InvoicesListPage() {
  const { data: invoices = [], isLoading, isError, error, refetch } = useInvoices();

  return (
    <section className="orders-page">
      <header className="orders-page__header"><div><h1 className="orders-page__title">Invoices Management</h1><p className="orders-page__subtitle">View, download, and print issued invoices</p></div><Link to="/dashboard" className="orders-btn">Back to dashboard</Link></header>
      {isError ? <div className="orders-error" role="alert"><p>{error instanceof Error ? error.message : 'Unable to load invoices.'}</p><button type="button" onClick={() => refetch()} className="orders-btn">Retry</button></div> : <div className="orders-surface"><InvoicesTable invoices={invoices} loading={isLoading} onDownload={downloadInvoicePdf} onPrint={printInvoice} /></div>}
    </section>
  );
}