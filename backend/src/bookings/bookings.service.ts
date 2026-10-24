import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingType, BookingStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  private generateReference(type: BookingType): string {
    const prefix = type === BookingType.appointment ? 'APT' : 'RES';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  async createAppointment(dto: CreateAppointmentDto) {
    const referenceNumber = this.generateReference(BookingType.appointment);

    // Link customer if phone exists
    const customer = await this.prisma.customer.findUnique({
      where: { phone: dto.customerPhone },
    });

    const timeline = [
      {
        status: BookingStatus.Pending,
        timestamp: new Date().toISOString(),
        note: 'Appointment requested via storefront portal',
        actor: dto.customerName,
      },
    ];

    const booking = await this.prisma.booking.create({
      data: {
        referenceNumber,
        bookingType: BookingType.appointment,
        status: BookingStatus.Pending,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        customerId: customer?.id,
        appointmentPurpose: dto.appointmentPurpose,
        appointmentDate: dto.appointmentDate,
        timeSlot: dto.timeSlot,
        notes: dto.notes,
        timeline,
      },
    });

    // Create DB notification record
    await this.prisma.notificationLog.create({
      data: {
        recipient: dto.customerPhone,
        channel: 'SMS',
        type: 'Appointment',
        content: `Your eye test appointment (${referenceNumber}) on ${dto.appointmentDate} at ${dto.timeSlot} is received! We will confirm shortly.`,
        status: 'Sent',
      },
    });

    return booking;
  }

  async createReservation(dto: CreateReservationDto) {
    const referenceNumber = this.generateReference(BookingType.reservation);

    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: dto.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant ${dto.variantId} not found.`);
      }

      const availableStock = variant.stockOnHand - variant.reservedQuantity;
      if (availableStock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock available for hold. Requested: ${dto.quantity}, Available: ${availableStock}`,
        );
      }

      // Atomically hold stock
      await tx.productVariant.update({
        where: { id: dto.variantId },
        data: {
          reservedQuantity: { increment: dto.quantity },
        },
      });

      // Record reservation hold stock movement
      await tx.stockMovement.create({
        data: {
          variantId: variant.id,
          variantSku: variant.variantSku,
          productName: variant.product.name,
          movementType: StockMovementType.reservation_hold,
          quantityDelta: dto.quantity,
          previousStock: variant.stockOnHand,
          newStock: variant.stockOnHand,
          referenceType: 'booking',
          referenceId: referenceNumber,
          reason: `Reserved for in-store trial by ${dto.customerName}`,
          performedBy: 'Storefront Customer',
        },
      });

      const customer = await tx.customer.findUnique({
        where: { phone: dto.customerPhone },
      });

      const pickupStart = new Date(dto.pickupDate);
      const pickupEnd = new Date(pickupStart);
      pickupEnd.setDate(pickupEnd.getDate() + 3); // 3-day default window

      const reservedItems = [
        {
          productId: variant.productId,
          productName: variant.product.name,
          variantId: variant.id,
          variantSku: variant.variantSku,
          colorName: variant.colorName,
          size: variant.size,
          quantity: dto.quantity,
          unitPrice: Number(variant.sellingPrice),
          imageUrl: variant.images[0] || variant.product.featuredImage,
        },
      ];

      const timeline = [
        {
          status: BookingStatus.Pending,
          timestamp: new Date().toISOString(),
          note: `Held ${dto.quantity}x ${variant.product.name} (${variant.variantSku}) for trial.`,
          actor: dto.customerName,
        },
      ];

      const booking = await tx.booking.create({
        data: {
          referenceNumber,
          bookingType: BookingType.reservation,
          status: BookingStatus.Pending,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          customerId: customer?.id,
          pickupWindowStart: pickupStart,
          pickupWindowEnd: pickupEnd,
          notes: dto.notes,
          reservedItems,
          timeline,
        },
      });

      await tx.notificationLog.create({
        data: {
          recipient: dto.customerPhone,
          channel: 'SMS',
          type: 'Reservation',
          content: `Product hold confirmed (${referenceNumber})! ${variant.product.name} is reserved for you until ${pickupEnd.toLocaleDateString()}.`,
          status: 'Sent',
        },
      });

      return booking;
    });
  }

  async lookup(referenceNumber: string, phone: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        referenceNumber: referenceNumber.trim().toUpperCase(),
        customerPhone: phone.trim(),
      },
    });

    if (!booking) {
      throw new NotFoundException(
        'No matching booking found for provided reference number and verification phone number.',
      );
    }

    return booking;
  }

  async findAll(params: {
    bookingType?: string;
    status?: string;
    search?: string;
    date?: string;
  }) {
    const where: any = {};

    if (params.bookingType && params.bookingType !== 'all') {
      where.bookingType = params.bookingType as BookingType;
    }

    if (params.status && params.status !== 'all') {
      where.status = params.status as BookingStatus;
    }

    if (params.date) {
      where.appointmentDate = params.date;
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { referenceNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q } },
      ];
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }

    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto, actorName: string = 'Staff') {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found.`);
      }

      const prevStatus = booking.status;
      const nextStatus = dto.status;

      // Handle stock release if a reservation was cancelled or expired
      if (
        booking.bookingType === BookingType.reservation &&
        (nextStatus === BookingStatus.Cancelled || nextStatus === BookingStatus.Expired) &&
        prevStatus !== BookingStatus.Cancelled &&
        prevStatus !== BookingStatus.Expired &&
        prevStatus !== BookingStatus.Collected &&
        prevStatus !== BookingStatus.Completed
      ) {
        const reservedItems = (booking.reservedItems as any[]) || [];
        for (const item of reservedItems) {
          if (item.variantId && item.quantity > 0) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                reservedQuantity: { decrement: item.quantity },
              },
            });

            await tx.stockMovement.create({
              data: {
                variantId: item.variantId,
                variantSku: item.variantSku,
                productName: item.productName,
                movementType: StockMovementType.reservation_release,
                quantityDelta: -item.quantity,
                previousStock: 0,
                newStock: 0,
                referenceType: 'booking',
                referenceId: booking.referenceNumber,
                reason: `Released reserved stock due to reservation ${nextStatus.toLowerCase()}`,
                performedBy: actorName,
              },
            });
          }
        }
      }

      const currentTimeline = (booking.timeline as any[]) || [];
      const newTimeline = [
        ...currentTimeline,
        {
          status: nextStatus,
          timestamp: new Date().toISOString(),
          note: dto.note || `Status transitioned from ${prevStatus} to ${nextStatus}`,
          actor: actorName,
        },
      ];

      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: nextStatus,
          assignedOptometrist: dto.assignedOptometrist || booking.assignedOptometrist,
          timeline: newTimeline,
        },
      });

      return updated;
    });
  }

  async cancelReservation(id: string, reason?: string, actorName: string = 'Customer') {
    return this.updateStatus(
      id,
      {
        status: BookingStatus.Cancelled,
        note: reason || 'Reservation cancelled by request',
      },
      actorName,
    );
  }
}
