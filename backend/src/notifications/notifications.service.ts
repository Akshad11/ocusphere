import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface NotificationProvider {
  sendSms(recipient: string, message: string): Promise<boolean>;
  sendWhatsApp(recipient: string, message: string): Promise<boolean>;
  sendEmail(recipient: string, subject: string, html: string): Promise<boolean>;
}

// Default in-database provider: logs record and flags simulated delivery
export class DatabaseNotificationProvider implements NotificationProvider {
  async sendSms(recipient: string, message: string): Promise<boolean> {
    return true;
  }
  async sendWhatsApp(recipient: string, message: string): Promise<boolean> {
    return true;
  }
  async sendEmail(recipient: string, subject: string, html: string): Promise<boolean> {
    return true;
  }
}

@Injectable()
export class NotificationsService {
  private provider: NotificationProvider = new DatabaseNotificationProvider();

  constructor(private prisma: PrismaService) {}

  async list(params?: { channel?: string; type?: string }) {
    const where: any = {};
    if (params?.channel && params.channel !== 'all') where.channel = params.channel;
    if (params?.type && params.type !== 'all') where.type = params.type;

    return this.prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async send(data: {
    recipient: string;
    channel: 'SMS' | 'WhatsApp' | 'Email';
    subject?: string;
    content: string;
    type: string;
  }) {
    // In demo environment, records entry in database with status 'Sent'
    return this.prisma.notificationLog.create({
      data: {
        recipient: data.recipient,
        channel: data.channel,
        subject: data.subject,
        content: data.content,
        type: data.type,
        status: 'Sent',
      },
    });
  }

  async retry(id: string) {
    const notif = await this.prisma.notificationLog.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException(`Notification ${id} not found.`);

    return this.prisma.notificationLog.update({
      where: { id },
      data: { status: 'Sent' },
    });
  }
}
