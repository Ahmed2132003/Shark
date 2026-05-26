// frontend/src/components/products/CategoryCard.jsx — NEW FILE (Phase 5)
// Shows category image if available, with fallback and lazy loading

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

function resolveImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  const apiOrigin = import.meta.env.VITE_API_ORIGIN?.trim() || 'http://localhost:8080';
  if (trimmed.startsWith('/')) return `${apiOrigin}${trimmed}`;
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || `${apiOrigin}/media/`;
  return `${mediaBase.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`;
}

export default function CategoryCard({ cat, index }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = resolveImageUrl(cat.image_url || cat.image);
  const showImage = imageUrl && !imgError;

  return (
    <Motion.div
      custom={index}
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        aspectRatio: '1',
      }}
    >
      <Link to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {/* Image or fallback */}
        <div style={{
          height: '55%',
          background: showImage ? '#000' : 'linear-gradient(135deg, var(--accent-glow), var(--bg-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {showImage ? (
            <img
              src={imageUrl}
              alt={cat.name}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
          ) : (
            <img
              src="/shark-logo.png"
              alt="Shark"
              style={{ width: '120px', height: 'auto', objectFit: 'contain' }}
            />
          )}
        </div>

        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {cat.name}
          </div>
          <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
            {cat.subcategories?.length > 0
              ? `${cat.subcategories.length} subcategor${cat.subcategories.length > 1 ? 'ies' : 'y'}`
              : 'Explore →'}
          </div>
        </div>

        {/* Hover overlay */}
        <Motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), transparent)',
            borderRadius: '20px',
          }}
        />
      </Link>
    </Motion.div>
  );
}