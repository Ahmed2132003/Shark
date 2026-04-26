const DASHBOARD_OVERVIEW_MOCK = {
  stats: [
    { key: 'sales', title: 'Total Sales', value: '$124,500', change: 12.4, trend: 'up' },
    { key: 'orders', title: 'Total Orders', value: '1,284', change: 8.2, trend: 'up' },
    { key: 'customers', title: 'Total Customers', value: '3,892', change: 3.1, trend: 'up' },
    { key: 'products', title: 'Total Products', value: '426', change: -1.7, trend: 'down' },
  ],
};

const MOCK_NETWORK_DELAY = 900;

export async function getDashboardOverview({ shouldFail = false } = {}) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Unable to load dashboard data. Please try again.'));
        return;
      }

      resolve(DASHBOARD_OVERVIEW_MOCK);
    }, MOCK_NETWORK_DELAY);
  });
}