import { ORDER_STATUSES } from '../../hooks/useOrders';

const SORT_OPTIONS = [
  { value: 'dateDesc', label: 'Newest first' },
  { value: 'dateAsc', label: 'Oldest first' },
  { value: 'priceDesc', label: 'Price: high to low' },
  { value: 'priceAsc', label: 'Price: low to high' },
];

export default function OrderFilters({ filters, onChange }) {
  return (
    <div className="orders-filters">      
      <input
        type="search"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value, page: 1 })}
        className="orders-input"        
        placeholder="Search by Order ID or customer"
      />

      <select
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value, page: 1 })}
        className="orders-select"        
      >
        <option value="all">All statuses</option>
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        value={filters.sortBy}
        onChange={(event) => onChange({ ...filters, sortBy: event.target.value, page: 1 })}
        className="orders-select"        
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}