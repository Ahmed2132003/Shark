// frontend/src/components/products/ProductBadges.jsx — NEW FILE (Phase 5)
// Reusable badges for Sold Out, Low Stock, Discount

export function SoldOutBadge({ style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'rgba(239,68,68,0.15)',
      border: '1px solid rgba(239,68,68,0.5)',
      color: '#ef4444',
      borderRadius: '8px', padding: '4px 10px',
      fontSize: '11px', fontWeight: 800, letterSpacing: '1px',
      textTransform: 'uppercase',
      ...style,
    }}>
      ✕ Sold Out
    </span>
  );
}

export function LowStockBadge({ quantity, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'rgba(245,158,11,0.15)',
      border: '1px solid rgba(245,158,11,0.5)',
      color: '#f59e0b',
      borderRadius: '8px', padding: '4px 10px',
      fontSize: '11px', fontWeight: 800, letterSpacing: '1px',
      ...style,
    }}>
      ⚠ Low Stock{quantity != null ? ` (${quantity})` : ''}
    </span>
  );
}

export function DiscountBadge({ percentage, style = {} }) {
  if (!percentage) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#fff',
      borderRadius: '8px', padding: '4px 10px',
      fontSize: '11px', fontWeight: 800, letterSpacing: '1px',
      ...style,
    }}>
      -{percentage}%
    </span>
  );
}

export function PriceDisplay({ basePrice, discountedPrice, discountIsActive, t, inline = false }) {
  if (!discountIsActive) {
    return (
      <span style={{
        fontSize: inline ? '20px' : 'clamp(22px, 3vw, 30px)', fontWeight: 800,
        background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {Number(basePrice).toLocaleString()} {t('common.egp')}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{
        fontSize: inline ? '13px' : '15px',
        color: 'var(--text-muted)',
        textDecoration: 'line-through',
        fontWeight: 500,
      }}>
        {Number(basePrice).toLocaleString()} {t('common.egp')}
      </span>
      <span style={{
        fontSize: inline ? '20px' : 'clamp(22px, 3vw, 30px)', fontWeight: 800,
        color: '#ef4444',
      }}>
        {Number(discountedPrice).toLocaleString()} {t('common.egp')}
      </span>
    </div>
  );
}
