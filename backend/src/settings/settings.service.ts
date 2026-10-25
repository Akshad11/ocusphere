import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let s = await this.prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (!s) {
      s = await this.prisma.storeSetting.create({
        data: {
          id: 'default',
          storeName: 'OcuSphere Eyewear Flagship',
          tagline: 'Precision Optics & Luxury Eyewear',
          address: {
            line1: 'Shop 4 & 5, Hill Road Promenade',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
          },
          phone: '+91 98200 11223',
          email: 'bandra@ocusphere.in',
          gstin: '27AABCU9603R1ZM',
          openingHours: {
            weekdays: '10:00 AM - 09:00 PM',
            saturday: '10:00 AM - 09:30 PM',
            sunday: '11:00 AM - 08:30 PM',
          },
        },
      });
    }

    return {
      ...s,
      taxRatePercent: Number(s.taxRatePercent),
    };
  }

  async updateSettings(dto: UpdateSettingsDto, actorName: string = 'Admin') {
    const updateData: any = {};
    if (dto.storeName !== undefined) updateData.storeName = dto.storeName;
    if (dto.tagline !== undefined) updateData.tagline = dto.tagline;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.gstin !== undefined) updateData.gstin = dto.gstin;
    if (dto.openingHours !== undefined) updateData.openingHours = dto.openingHours;
    if (dto.bookingCapacityPerHour !== undefined) updateData.bookingCapacityPerHour = dto.bookingCapacityPerHour;
    if (dto.reservationHoldDays !== undefined) updateData.reservationHoldDays = dto.reservationHoldDays;
    if (dto.taxRatePercent !== undefined) updateData.taxRatePercent = dto.taxRatePercent;
    if (dto.receiptHeader !== undefined) updateData.receiptHeader = dto.receiptHeader;
    if (dto.receiptFooter !== undefined) updateData.receiptFooter = dto.receiptFooter;
    if (dto.enableSmsNotifications !== undefined) updateData.enableSmsNotifications = dto.enableSmsNotifications;
    if (dto.enableWhatsappNotifications !== undefined) updateData.enableWhatsappNotifications = dto.enableWhatsappNotifications;
    if (dto.enableEmailNotifications !== undefined) updateData.enableEmailNotifications = dto.enableEmailNotifications;

    const defaultStoreSetting = {
      id: 'default',
      storeName: 'OcuSphere Optical Lounge',
      tagline: 'Precision Vision & Designer Eyewear',
      address: {
        street: '124 Linking Road, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      phone: '+91 22 2640 1234',
      email: 'concierge@ocusphere.in',
      gstin: '27AABCO1234A1Z5',
      openingHours: 'Mon - Sun: 10:00 AM - 09:30 PM',
      bookingCapacityPerHour: 4,
      reservationHoldDays: 2,
      taxRatePercent: 12.0,
      receiptHeader: 'OcuSphere Flagship Optical Lounge',
      receiptFooter: 'Thank you for choosing OcuSphere for your visual wellness.',
    };

    const updated = await this.prisma.storeSetting.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        ...defaultStoreSetting,
        ...updateData,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Owner/Admin',
        action: 'UPDATE',
        entity: 'Settings',
        summary: `Updated optical store configuration and policies`,
      },
    });

    return {
      ...updated,
      taxRatePercent: Number(updated.taxRatePercent),
    };
  }
}
