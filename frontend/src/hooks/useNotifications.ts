import { useState, useEffect, useCallback } from 'react';
import { NotificationChannel, NotificationLog, NotificationStatus } from '../types/notification.types';
import { mockNotificationService } from '../services/mockNotificationService';
import { mockStore } from '../services/mockApiClient';

export function useNotifications(params?: {
  channel?: NotificationChannel | 'all';
  status?: NotificationStatus | 'all';
  search?: string;
}) {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockNotificationService.list(params);
      setNotifications(Array.isArray(res) ? res : (res as any)?.items || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchNotifs();
    const unsubscribe = mockStore.subscribe(() => {
      fetchNotifs();
    });
    return unsubscribe;
  }, [fetchNotifs]);

  const retry = async (id: string) => {
    return await mockNotificationService.retry(id);
  };

  const deleteNotification = async (id: string) => {
    return await mockNotificationService.delete(id);
  };

  return { notifications: Array.isArray(notifications) ? notifications : [], loading, error, refresh: fetchNotifs, retry, deleteNotification };
}
