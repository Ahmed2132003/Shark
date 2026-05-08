import api from './api';

function normalizeInvoice(invoice) {
  const rawItems = [
    invoice.items,
    invoice.products,
    invoice.itemized_products,
    invoice.invoice_items,
    invoice.order_items,
  ].find((value) => Array.isArray(value)) || [];
  const shipping = Number(invoice.shipping ?? invoice.shipping_cost ?? invoice.delivery_fee ?? invoice.order?.shipping_fee ?? 0);
  const subtotal = Number(invoice.subtotal ?? 0);
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total ?? 0);

  return {
    ...invoice,
    id: invoice.id,
    invoiceId: invoice.invoice_number || invoice.id,
    customerName: invoice.customer_name || invoice.customer?.name || 'Unknown customer',
    customerEmail: invoice.customer_email || invoice.customer?.email || '',
    customerPhone: invoice.customer_phone || invoice.customer?.phone || '',
    customerAddress: invoice.customer_address || '',    
    orderId: invoice.order?.id || invoice.order_id || null,
    status: (invoice.status || 'draft').toLowerCase(),    
    issueDate: invoice.issued_at || invoice.created_at,
    subtotal,
    tax,
    total,
    shipping,    
    items: rawItems.map((item, index) => ({
      id: item.id || item.product_id || `${invoice.id}-${index}`,
      productName: item.product_name || item.product_title || item.name || item.title || item.variant_name || item.product?.name || 'Product',
      variantName: item.variant_name || '',
      size: item.size || null,
      color: item.color || null,
      quantity: Number(item.quantity || 0),
      price: Number(item.unit_price || item.price || 0),
      total: Number(item.subtotal || item.line_total || Number(item.total_price || 0) || 0),      
      image: item.product_image || item.image || item.product?.image || null,
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