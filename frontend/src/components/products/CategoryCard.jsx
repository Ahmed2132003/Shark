// frontend/src/components/products/CategoryCard.jsx — UPDATED
// Shows category image filling the full card, with name overlaid via gradient

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
        {/* Image (or fallback) fills the ENTIRE card — no split sections, no gaps */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: showImage ? '#000' : 'linear-gradient(135deg, var(--accent-glow), var(--bg-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {showImage ? (
            <img
              src={imageUrl}
              alt={cat.name}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                display: 'block',    // removes the default inline-image baseline gap
                width: '100%',
                height: '100%',
                objectFit: 'cover',  // image always fills the box, cropped not squeezed
                objectPosition: 'center',
              }}
            />
          ) : (
            <span
              className="shark-logo-mark"
              role="img"
              aria-label="Shark"
              style={{ width: '120px', height: '40px' }}
            />
          )}
        </div>

        {/* Bottom gradient so the name stays readable over any image */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Name + subcategory count, overlaid on the image */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          padding: '16px 18px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '17px', color: '#fff', marginBottom: '4px', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
            {cat.name}
          </div>
          <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
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
            background: 'linear-gradient(135deg, rgba(108,99,255,0.18), transparent)',
          }}
        />
      </Link>
    </Motion.div>
  );
}