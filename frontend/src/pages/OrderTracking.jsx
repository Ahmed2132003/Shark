import { Link, useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const STATUS_META = {
  pending: {
    emoji: '🕒',
    en: 'Pending',
    ar: 'قيد الانتظار',
    color: '#f59e0b',
  },
  confirmed: {
    emoji: '✅',
    en: 'Confirmed',
    ar: 'تم التأكيد',
    color: '#10b981',
  },
  shipped: {
    emoji: '🚚',
    en: 'Shipped',
    ar: 'تم الشحن',
    color: '#3b82f6',
  },
  delivered: {
    emoji: '📦',
    en: 'Delivered',
    ar: 'تم التوصيل',
    color: '#8b5cf6',
  },
  cancelled: {
    emoji: '❌',
    en: 'Cancelled',
    ar: 'ملغي',
    color: '#ef4444',
  },
};

function formatDate(value, isRTL) {
  if (!value) return '--';
  const date = new Date(value);
  return date.toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function TrackingSkeleton() {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {[...Array(3)].map((_, i) => (
        <Motion.div
          key={i}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          style={{
            borderRadius: '18px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            minHeight: i === 0 ? '130px' : '220px',
          }}
        />
      ))}
    </div>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const {
    data: order,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: () => api.get(`/orders/track/${id}/`).then((res) => res.data),
    enabled: Boolean(id),
    retry: 1,
  });

  const currentStatus = STATUS_META[order?.status] || STATUS_META.pending;
  const history = [...(order?.history || [])].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  );

  return (    
import { Link, useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const STATUS_META = {
  pending: {
    emoji: '🕒',
    en: 'Pending',
    ar: 'قيد الانتظار',
    color: '#f59e0b',
  },
  confirmed: {
    emoji: '✅',
    en: 'Confirmed',
    ar: 'تم التأكيد',
    color: '#10b981',
  },
  shipped: {
    emoji: '🚚',
    en: 'Shipped',
    ar: 'تم الشحن',
    color: '#3b82f6',
  },
  delivered: {
    emoji: '📦',
    en: 'Delivered',
    ar: 'تم التوصيل',
    color: '#8b5cf6',
  },
  cancelled: {
    emoji: '❌',
    en: 'Cancelled',
    ar: 'ملغي',
    color: '#ef4444',
  },
};

function formatDate(value, isRTL) {
  if (!value) return '--';
  const date = new Date(value);
  return date.toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function TrackingSkeleton() {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {[...Array(3)].map((_, i) => (
        <Motion.div
          key={i}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          style={{
            borderRadius: '18px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            minHeight: i === 0 ? '130px' : '220px',
          }}
        />
      ))}
    </div>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const {
    data: order,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: () => api.get(`/orders/track/${id}/`).then((res) => res.data),
    enabled: Boolean(id),
    retry: 1,
  });

  const currentStatus = STATUS_META[order?.status] || STATUS_META.pending;
  const history = [...(order?.history || [])].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <h1 className="text-white text-3xl font-bold">OrderTracking Page</h1>
    <div style={{ minHeight: '100vh', padding: '40px 5%' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--accent)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 800,
              marginBottom: '8px',
            }}
          >
            ✦ {isRTL ? 'المرحلة 4' : 'Phase 4'}
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '8px' }}>
            {isRTL ? 'تتبع الطلب' : 'Order Tracking'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isRTL
              ? `تابع حالة طلبك رقم #${id} خطوة بخطوة.`
              : `Track your order #${id} step by step.`}
          </p>
        </div>

        {isLoading ? (
          <TrackingSkeleton />
        ) : error ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>🔍</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isRTL ? 'لم يتم العثور على الطلب' : 'Order not found'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
              {isRTL
                ? 'تأكد من رقم الطلب وحاول مرة أخرى.'
                : 'Please verify the order number and try again.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => refetch()}
                style={{
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
                  color: '#fff',
                }}
              >
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </button>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  {isRTL ? 'العودة للرئيسية' : 'Back to home'}
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <Motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                padding: '24px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                {[
                  {
                    label: isRTL ? 'رقم الطلب' : 'Order ID',
                    value: `#${order.id}`,
                  },
                  {
                    label: isRTL ? 'الحالة الحالية' : 'Current status',
                    value: `${currentStatus.emoji} ${isRTL ? currentStatus.ar : currentStatus.en}`,
                    highlight: currentStatus.color,
                  },
                  {
                    label: isRTL ? 'إجمالي الطلب' : 'Order total',
                    value: `${Number(order.total).toLocaleString()} EGP`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '12px',
                      background: 'var(--bg-primary)',
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>{item.label}</div>
                    <div style={{ color: item.highlight || 'var(--text-primary)', fontWeight: 800 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </Motion.section>

            <Motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                padding: '24px',
              }}
            >
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '18px' }}>
                {isRTL ? 'سجل حالة الطلب' : 'Order status timeline'}
              </h2>

              {history.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isRTL
                    ? 'لا يوجد تحديثات بعد. سيتم عرض كل تغيير حالة هنا.'
                    : 'No updates yet. Every status change will appear here.'}
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {history.map((step, index) => {
                    const meta = STATUS_META[step.status] || STATUS_META.pending;
                    return (
                      <div
                        key={`${step.changed_at}-${index}`}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '14px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: 'var(--bg-primary)',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '999px',
                            display: 'grid',
                            placeItems: 'center',
                            background: `${meta.color}22`,
                            color: meta.color,
                            fontSize: '18px',
                            flexShrink: 0,
                          }}
                        >
                          {meta.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '4px' }}>
                            {isRTL ? meta.ar : meta.en}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: step.note ? '5px' : 0 }}>
                            {formatDate(step.changed_at, isRTL)}
                          </div>
                          {step.note && <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{step.note}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Motion.section>
          </>
        )}
      </div>      
    </div>
  )
}
