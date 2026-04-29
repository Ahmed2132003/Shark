import StatsCard from '../dashboard/StatsCard';
import { formatDate, formatMoney } from '../orders/orderUtils';

export default function CustomerStats({ totalOrders, totalSpent, lastOrderDate }) {
  const stats = [
    { key: 'orders', title: 'Total Orders', value: totalOrders },
    { key: 'sales', title: 'Total Spent', value: formatMoney(totalSpent) },
    { key: 'customers', title: 'Last Order Date', value: lastOrderDate ? formatDate(lastOrderDate) : 'N/A' },
  ];

  return <div className="stats-grid">{stats.map((stat) => <StatsCard key={stat.key + stat.title} title={stat.title} value={stat.value} icon={stat.key} />)}</div>;
}