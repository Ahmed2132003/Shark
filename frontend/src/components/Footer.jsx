import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const t = (key) => {
    const messages = {
      'footer.line1': isRTL ? 'متجر شارك — أزياء وإكسسوارات عالية الجودة.' : 'Shark Store — Quality fashion and accessories.',
      'footer.line2': isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.',
    };
    return messages[key] ?? key;
  };

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