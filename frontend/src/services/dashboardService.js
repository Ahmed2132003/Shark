import api from './api';

function calculateGrowth(currentValue = 0, previousValue = 0) {
  if (!previousValue) {
    return currentValue ? 100 : 0;
  }

  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(2));
}

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat('en-US').format(value);
}

function mapDashboardStats(payload) {
  const revenueThisMonth = Number(payload?.revenue?.this_month ?? 0) || 0;
  const revenueGrowth = Number(payload?.revenue?.growth ?? 0) || 0;
  const shippingThisMonth = Number(
    payload?.shipping?.this_month
      ?? payload?.shippingPrice
      ?? payload?.shipping_cost
      ?? 0,
  ) || 0;
  const netRevenueThisMonth = revenueThisMonth - shippingThisMonth;

  const ordersThisMonth = payload?.orders?.this_month ?? 0;
  const ordersLastMonth = payload?.orders?.last_month ?? 0;

  const customersThisMonth = payload?.customers?.new_this_month ?? 0;
  const customersLastMonth = Math.max(
    (payload?.customers?.total ?? 0) - customersThisMonth,
    0,
  );

  return {
    stats: [
      {
        key: 'sales',
        title: 'Total Sales',
        value: formatCurrency(revenueThisMonth),
        change: Number(revenueGrowth),
        trend: revenueGrowth < 0 ? 'down' : 'up',
      },
      {
        key: 'shipping',
        title: 'Total Shipping',
        value: formatCurrency(shippingThisMonth),
      },
      {
        key: 'net-revenue',
        title: 'Net Revenue',
        value: formatCurrency(netRevenueThisMonth),
      },
      {
        key: 'orders',
        title: 'Total Orders',
        value: formatNumber(payload?.orders?.total ?? 0),
        change: calculateGrowth(ordersThisMonth, ordersLastMonth),
        trend: ordersThisMonth < ordersLastMonth ? 'down' : 'up',
      },
      {
        key: 'customers',
        title: 'Total Customers',
        value: formatNumber(payload?.customers?.total ?? 0),
        change: calculateGrowth(customersThisMonth, customersLastMonth),
        trend: customersThisMonth < customersLastMonth ? 'down' : 'up',
      },
      {
        key: 'products',
        title: 'Total Products',
        value: formatNumber(payload?.products?.total ?? 0),
      },
    ],
    raw: payload,
  };
}

export async function getDashboardOverview() {
  try {
    const response = await api.get('/dashboard/stats/');
    return mapDashboardStats(response.data);
  } catch (error) {
    const serverMessage = error?.response?.data?.detail;
    throw new Error(serverMessage || 'Unable to load dashboard data. Please try again.');
  }
}

export default getDashboardOverview;