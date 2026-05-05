import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '14px 5%',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        background: 'var(--bg-secondary)',
      }}
    >
      <p style={{ margin: 0 }}>{t('footer.line1')}</p>
      <p style={{ margin: 0 }}>{t('footer.line2')}</p>
    </footer>
  );
}