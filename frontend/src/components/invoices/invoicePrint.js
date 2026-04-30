import { formatDate, formatMoney } from '../orders/orderUtils';

function rows(items) {
  return items.map((item) => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${formatMoney(item.price)}</td><td>${formatMoney(item.total)}</td></tr>`).join('');
}

function invoiceHtml(invoice) {
  return `<!doctype html><html><head><title>Invoice ${invoice.invoiceId}</title><style>
  body{font-family:Arial,sans-serif;padding:24px;color:#111}h1,h2,p{margin:0 0 8px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:8px;text-align:left}.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.totals{max-width:320px;margin-left:auto;margin-top:16px}.totals div{display:flex;justify-content:space-between;margin:6px 0}
  </style></head><body>
  <h1>SHARK Company</h1><p>Invoice: ${invoice.invoiceId}</p><p>Issue Date: ${formatDate(invoice.issueDate)}</p>
  <div class="meta"><div><h2>Customer Info</h2><p>${invoice.customerName}</p><p>${invoice.customer_email || ''}</p><p>${invoice.customer_phone || ''}</p><p>${invoice.customer_address || ''}</p></div><div><h2>Invoice Info</h2><p>Status: ${invoice.status}</p><p>Order: ${invoice.orderId || '-'}</p></div></div>
  <table><thead><tr><th>Product Name</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows(invoice.items)}</tbody></table>
  <div class="totals"><div><span>Subtotal</span><span>${formatMoney(invoice.subtotal)}</span></div><div><span>Taxes</span><span>${formatMoney(invoice.tax)}</span></div><div><strong>Total</strong><strong>${formatMoney(invoice.total)}</strong></div></div>
  </body></html>`;
}

export function printInvoice(invoice) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;
  win.document.write(invoiceHtml(invoice));
  win.document.close();
  win.focus();
  win.print();
}

export function downloadInvoicePdf(invoice) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;
  win.document.write(invoiceHtml(invoice));
  win.document.close();
  win.focus();
  win.print();
}