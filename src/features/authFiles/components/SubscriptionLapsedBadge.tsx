import { useTranslation } from 'react-i18next';
import styles from './AuthFileCard.module.scss';

export function SubscriptionLapsedBadge() {
  const { t } = useTranslation();
  return (
    <span className={styles.lapsedBadge} title={t('auth_files.subscription_lapsed_hint')}>
      {t('auth_files.subscription_lapsed')}
    </span>
  );
}
