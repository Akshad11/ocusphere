export type NotificationChannel = 'SMS' | 'WhatsApp' | 'Email' | 'In-App System';

export type NotificationTemplate =
  | 'Appointment Confirmation'
  | 'Reservation Confirmation'
  | 'Ready for Pickup'
  | 'Low-Stock Alert'
  | 'Stock Request Submitted'
  | 'Stock Request Approval'
  | 'Stock Request Rejection'
  | 'Payment Receipt';

export type NotificationStatus = 'Queued' | 'Sent' | 'Delivered' | 'Failed';

export interface NotificationLog {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  recipientName: string;
  template: NotificationTemplate;
  title: string;
  messageContent: string;
  status: NotificationStatus;
  attemptCount: number;
  lastAttemptAt: string;
  errorMessage?: string;
  metadata?: Record<string, string>;
  createdAt: string;
}
