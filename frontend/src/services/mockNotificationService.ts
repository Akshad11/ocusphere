import { NotificationChannel, NotificationLog, NotificationStatus } from '../types/notification.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface NotificationService {
  list(params?: { channel?: NotificationChannel | 'all'; status?: NotificationStatus | 'all'; search?: string }): Promise<NotificationLog[]>;
  retry(id: string): Promise<NotificationLog>;
  delete(id: string): Promise<boolean>;
}

class MockNotificationServiceImpl implements NotificationService {
  async list(params = {} as { channel?: string; status?: string; search?: string }): Promise<NotificationLog[]> {
    let list = [...mockStore.notifications];

    if (params.channel && params.channel !== 'all') {
      list = list.filter((n) => n.channel === params.channel);
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((n) => n.status === params.status);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (n) =>
          n.recipient.toLowerCase().includes(q) ||
          n.recipientName.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.messageContent.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(list);
  }

  async retry(id: string): Promise<NotificationLog> {
    const notif = mockStore.notifications.find((n) => n.id === id);
    if (!notif) throw new Error(`Notification ${id} not found`);

    notif.attemptCount += 1;
    notif.lastAttemptAt = new Date().toISOString();
    notif.status = 'Delivered';
    notif.errorMessage = undefined;

    mockStore.save('notifications', mockStore.notifications);
    return simulateNetwork(notif);
  }

  async delete(id: string): Promise<boolean> {
    const idx = mockStore.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      mockStore.notifications.splice(idx, 1);
      mockStore.save('notifications', mockStore.notifications);
      return simulateNetwork(true);
    }
    return simulateNetwork(false);
  }
}

export const mockNotificationService = new MockNotificationServiceImpl();
