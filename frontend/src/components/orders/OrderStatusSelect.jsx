import { ORDER_STATUSES } from '../../hooks/useOrders';

export default function OrderStatusSelect({ value, onChange, loading }) {
  return (
    <label className="orders-field-label">      
      Update Status
      <select
        className="orders-select"        
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </label>
  );
}