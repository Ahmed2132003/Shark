import api from './api';

function normalizeInvoice(invoice) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = Number(invoice.subtotal ?? items.reduce((sum, item) => sum + Number(item.unit_price || item.price || 0) * Number(item.quantity || 0), 0));
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total ?? subtotal + tax);

  return {
    ...invoice,
    id: invoice.id,
    invoiceId: invoice.invoice_number || invoice.id,
    customerName: invoice.customer_name || invoice.customer?.name || 'Unknown customer',
    orderId: invoice.order?.id || invoice.order_id || null,
    status: (invoice.status || 'pending').toLowerCase() === 'void' ? 'cancelled' : (invoice.status || 'pending').toLowerCase() === 'issued' ? 'pending' : (invoice.status || 'pending').toLowerCase(),
    issueDate: invoice.issued_at || invoice.created_at,
    subtotal,
    tax,
    total,
    items: items.map((item) => ({
      id: item.id,
      productName: item.product_name || item.name || 'Product',
      quantity: Number(item.quantity || 0),
      price: Number(item.unit_price || item.price || 0),
      total: Number(item.subtotal || Number(item.unit_price || item.price || 0) * Number(item.quantity || 0)),
    })),
  };
}

export async function fetchInvoices() {
  const response = await api.get('/invoices/admin/');
  const payload = response.data;
  const items = Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload) ? payload : []);
  return items.map(normalizeInvoice);
}

export async function fetchInvoiceById(id) {
  const response = await api.get(`/invoices/admin/${id}/`);
  return normalizeInvoice(response.data);
}