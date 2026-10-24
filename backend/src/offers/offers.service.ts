import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ValidateCouponDto, RedeemCouponDto } from './dto/validate-coupon.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async listOffers(activeOnly: boolean = false) {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    }

    const offers = await this.prisma.offer.findMany({
      where,
      include: { coupons: true },
      orderBy: { createdAt: 'desc' },
    });

    return offers.map((o) => ({
      ...o,
      discountValue: Number(o.discountValue),
      minimumPurchase: Number(o.minimumPurchase),
      maximumDiscount: o.maximumDiscount ? Number(o.maximumDiscount) : undefined,
    }));
  }

  async getOffer(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { coupons: true },
    });

    if (!offer) throw new NotFoundException(`Offer with ID ${id} not found.`);

    return {
      ...offer,
      discountValue: Number(offer.discountValue),
      minimumPurchase: Number(offer.minimumPurchase),
      maximumDiscount: offer.maximumDiscount ? Number(offer.maximumDiscount) : undefined,
    };
  }

  async createOffer(dto: CreateOfferDto, actorName: string = 'Staff') {
    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          name: dto.name,
          description: dto.description,
          discountType: dto.discountType,
          discountValue: dto.discountValue,
          minimumPurchase: dto.minimumPurchase,
          maximumDiscount: dto.maximumDiscount,
          applicableCategory: dto.applicableCategory,
          applicableProductId: dto.applicableProductId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          usageLimit: dto.usageLimit,
        },
      });

      if (dto.coupons && dto.coupons.length > 0) {
        for (const c of dto.coupons) {
          await tx.coupon.create({
            data: {
              code: c.code.trim().toUpperCase(),
              offerId: offer.id,
              offerName: offer.name,
              usageLimit: c.usageLimit || 100,
              perCustomerLimit: c.perCustomerLimit || 1,
              expiryDate: new Date(c.expiryDate),
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorName,
          actorRole: 'Marketing Manager',
          action: 'CREATE',
          entity: 'Offer',
          entityId: offer.id,
          summary: `Created promotion "${offer.name}" (${offer.discountType}: ${offer.discountValue})`,
        },
      });

      return tx.offer.findUnique({
        where: { id: offer.id },
        include: { coupons: true },
      });
    });
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({
      include: { offer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateCoupon(dto: ValidateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: { offer: true },
    });

    if (!coupon || !coupon.isActive || !coupon.offer.isActive) {
      throw new BadRequestException(`Coupon code "${code}" is invalid or has been deactivated.`);
    }

    const now = new Date();
    if (coupon.expiryDate < now || coupon.offer.endDate < now) {
      throw new BadRequestException(`Coupon code "${code}" expired on ${coupon.expiryDate.toLocaleDateString()}.`);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon code "${code}" has reached its maximum total redemptions.`);
    }

    const subtotal = new Decimal(dto.subtotal);
    const minPurchase = new Decimal(coupon.offer.minimumPurchase.toString());
    if (subtotal.lessThan(minPurchase)) {
      throw new BadRequestException(
        `Coupon requires a minimum purchase value of ₹${minPurchase.toFixed(2)}. Current subtotal is ₹${subtotal.toFixed(2)}.`,
      );
    }

    // Check per-customer redemptions if phone provided
    if (dto.customerPhone) {
      const redemptionsCount = await this.prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          customerPhone: dto.customerPhone,
        },
      });

      if (redemptionsCount >= coupon.perCustomerLimit) {
        throw new BadRequestException(
          `Customer with phone ${dto.customerPhone} has already claimed the maximum allowed ${coupon.perCustomerLimit} redemption(s) for this coupon.`,
        );
      }
    }

    let calculatedDiscount = new Decimal(0);
    if (coupon.offer.discountType === 'Percentage') {
      const pct = new Decimal(coupon.offer.discountValue.toString()).dividedBy(100);
      calculatedDiscount = subtotal.times(pct);
      if (coupon.offer.maximumDiscount) {
        const maxDisc = new Decimal(coupon.offer.maximumDiscount.toString());
        calculatedDiscount = Decimal.min(calculatedDiscount, maxDisc);
      }
    } else if (coupon.offer.discountType === 'Fixed_Amount') {
      calculatedDiscount = Decimal.min(subtotal, new Decimal(coupon.offer.discountValue.toString()));
    }

    const discountedTotal = Decimal.max(0, subtotal.minus(calculatedDiscount));

    return {
      isValid: true,
      couponCode: coupon.code,
      offerName: coupon.offer.name,
      discountType: coupon.offer.discountType,
      discountValue: Number(coupon.offer.discountValue),
      discountAmount: calculatedDiscount.toNumber(),
      newSubtotal: discountedTotal.toNumber(),
      message: `Coupon "${coupon.code}" successfully applied! Saved ₹${calculatedDiscount.toFixed(2)}.`,
    };
  }

  async redeemCoupon(dto: RedeemCouponDto) {
    const validation = await this.validateCoupon(dto);

    return this.prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.findUnique({
        where: { code: dto.code.trim().toUpperCase() },
        include: { offer: true },
      });

      if (!coupon) throw new NotFoundException('Coupon not found.');

      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });

      await tx.offer.update({
        where: { id: coupon.offerId },
        data: { usedCount: { increment: 1 } },
      });

      const redemption = await tx.couponRedemption.create({
        data: {
          couponId: coupon.id,
          saleId: dto.saleId,
          customerPhone: dto.customerPhone,
          discountAmount: validation.discountAmount,
        },
      });

      return {
        success: true,
        redemption,
        validation,
      };
    });
  }
}
