import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import styles from './AuthFileCard.module.scss';

export function UseOnceButtons({
  minRemaining,
  credentialDisabled = false,
  routingStopped,
  disabled,
  onStart,
}: {
  minRemaining: number;
  credentialDisabled?: boolean;
  routingStopped: boolean;
  disabled: boolean;
  onStart: (target: number) => void;
}) {
  const { t } = useTranslation();
  if (!routingStopped) {
    return (
      <>
        <span className={styles.useOnceBadge}>
          {t('auth_files.use_once_active', { percent: minRemaining })}
        </span>
      </>
    );
  }

  return (
    <>
      <span>
        {t(
          credentialDisabled
            ? 'auth_files.credential_disabled'
            : routingStopped
              ? 'auth_files.routing_stopped'
              : 'auth_files.routing_active'
        )}
      </span>
      <Button size="sm" disabled={disabled} onClick={() => onStart(minRemaining)}>
        {t(minRemaining > 0 ? 'auth_files.use_once_to' : 'auth_files.use_once_label', {
          percent: minRemaining,
        })}
      </Button>
      {minRemaining > 0 && (
        <Button size="sm" disabled={disabled} onClick={() => onStart(0)}>
          {t('auth_files.use_once_to', { percent: 0 })}
        </Button>
      )}
    </>
  );
}
