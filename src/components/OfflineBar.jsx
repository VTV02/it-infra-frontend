import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { onSyncStatus } from '../utils/syncManager';

export default function OfflineBar() {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  const [syncInfo, setSyncInfo] = useState(null);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    return onSyncStatus(setSyncInfo);
  }, []);

  // Show "back online" briefly when reconnecting
  useEffect(() => {
    if (online) {
      setShowOnline(true);
      const timer = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [online]);

  if (!online) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-white text-center text-xs py-1.5 font-medium shadow-sm">
        {t('offline.no_connection') || 'Không có kết nối mạng — Dữ liệu sẽ tự đồng bộ khi có mạng'}
      </div>
    );
  }

  if (syncInfo?.syncing) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-blue-500 text-white text-center text-xs py-1.5 font-medium shadow-sm">
        {t('offline.syncing') || 'Đang đồng bộ dữ liệu...'} ({syncInfo.pending})
      </div>
    );
  }

  if (syncInfo?.synced > 0 || showOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-500 text-white text-center text-xs py-1.5 font-medium shadow-sm animate-pulse">
        {syncInfo?.synced > 0
          ? `${t('offline.synced') || 'Đã đồng bộ'} ${syncInfo.synced} ${t('offline.items') || 'mục'}${syncInfo.failed ? ` (${syncInfo.failed} lỗi)` : ''}`
          : (t('offline.back_online') || 'Đã kết nối lại')}
      </div>
    );
  }

  return null;
}
