import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import { Decimal } from 'decimal.js';
import { StockMovementType, SaleStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.sale.count();
    const seq = (count + 1).toString().padStart(4, '0');
    return `INV-${year}-${seq}`;
  }

  private async generateReturnNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.saleReturn.count();
    const seq = (count + 1).toString().padStart(4, '0');
    return `RET-${year}-${seq}`;
  }

  async createSale(dto: CreateSaleDto, cashierName: string = 'Cashier') {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('A sale must include at least one product item.');
    }

    // Check idempotency key if provided
    if (dto.idempotencyKey) {
      const existing = await this.prisma.sale.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { items: true },
      });
      if (existing) {
        return this.mapSale(existing);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const invoiceNumber = await this.generateInvoiceNumber(tx);

      // 1. Fetch store settings for tax rate
      const settings = await tx.storeSetting.findUnique({ where: { id: 'default' } });
      const taxRatePercent = settings ? Number(settings.taxRatePercent) : 12.0;

      // 2. Fetch trusted variants from DB
      const variantIds = dto.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });

      if (variants.length !== variantIds.length) {
        throw new NotFoundException('One or more selected product variants could not be found.');
      }

      const variantMap = new Map<string, any>(variants.map((v) => [v.id, v]));

      // 3. Verify stock and calculate trusted line items
      let rawSubtotal = new Decimal(0);
      const preparedSaleItems = [];

      for (const itemDto of dto.items) {
        const variant = variantMap.get(itemDto.variantId);
        if (!variant) {
          throw new NotFoundException(`Variant ${itemDto.variantId} not found.`);
        }

        if (variant.stockOnHand < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${variant.product.name} (${variant.variantSku})". Available: ${variant.stockOnHand}, Requested: ${itemDto.quantity}`,
          );
        }

        const unitPrice = new Decimal(variant.sellingPrice.toString());
        const quantity = new Decimal(itemDto.quantity);
        const itemDiscount = new Decimal(itemDto.itemDiscount || 0);

        const lineGross = unitPrice.times(quantity);
        const lineTotal = Decimal.max(0, lineGross.minus(itemDiscount));
        rawSubtotal = rawSubtotal.plus(lineGross);

        preparedSaleItems.push({
          variantId: variant.id,
          variantSku: variant.variantSku,
          productName: variant.product.name,
          brand: variant.product.brand,
          colorName: variant.colorName,
          size: variant.size,
          unitPrice,
          quantity: itemDto.quantity,
          discount: itemDiscount,
          taxableAmount: lineTotal,
          total: lineTotal,
          variantRef: variant,
        });
      }

      // 4. Validate Coupon if applied
      let couponDiscount = new Decimal(0);
      let validatedCouponCode: string | null = null;

      if (dto.appliedCoupon) {
        const coupon = await tx.coupon.findUnique({
          where: { code: dto.appliedCoupon.trim().toUpperCase() },
          include: { offer: true },
        });

        if (!coupon || !coupon.isActive || !coupon.offer.isActive) {
          throw new BadRequestException(`Coupon code "${dto.appliedCoupon}" is invalid or inactive.`);
        }

        const now = new Date();
        if (coupon.expiryDate < now || coupon.offer.endDate < now) {
          throw new BadRequestException(`Coupon code "${dto.appliedCoupon}" has expired.`);
        }

        if (coupon.usedCount >= coupon.usageLimit) {
          throw new BadRequestException(`Coupon code "${dto.appliedCoupon}" has reached its maximum redemption limit.`);
        }

        const minPurchase = new Decimal(coupon.offer.minimumPurchase.toString());
        if (rawSubtotal.lessThan(minPurchase)) {
          throw new BadRequestException(
            `Coupon requires minimum purchase of ₹${minPurchase.toFixed(2)}. Current subtotal: ₹${rawSubtotal.toFixed(2)}`,
          );
        }

        if (coupon.offer.discountType === 'Percentage') {
          const pct = new Decimal(coupon.offer.discountValue.toString()).dividedBy(100);
          couponDiscount = rawSubtotal.times(pct);
          if (coupon.offer.maximumDiscount) {
            const maxDisc = new Decimal(coupon.offer.maximumDiscount.toString());
            couponDiscount = Decimal.min(couponDiscount, maxDisc);
          }
        } else if (coupon.offer.discountType === 'Fixed_Amount') {
          couponDiscount = Decimal.min(rawSubtotal, new Decimal(coupon.offer.discountValue.toString()));
        }

        validatedCouponCode = coupon.code;

        // Atomically increment coupon usedCount
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.offer.update({
          where: { id: coupon.offerId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 5. Total Calculations (Decimal safe)
      const totalDiscount = couponDiscount;
      const netTaxable = Decimal.max(0, rawSubtotal.minus(totalDiscount));
      const taxRateDec = new Decimal(taxRatePercent).dividedBy(100);
      const taxTotal = netTaxable.times(taxRateDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const grandTotal = netTaxable.plus(taxTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      let changeGiven = new Decimal(0);
      if (dto.paymentMethod === PaymentMethod.Cash && dto.amountReceived) {
        const received = new Decimal(dto.amountReceived);
        if (received.greaterThanOrEqualTo(grandTotal)) {
          changeGiven = received.minus(grandTotal);
        }
      }

      // 6. Link Customer
      let customerId = dto.customerId;
      if (!customerId && dto.customerPhone) {
        const existingCust = await tx.customer.findUnique({ where: { phone: dto.customerPhone } });
        if (existingCust) {
          customerId = existingCust.id;
        }
      }

      // 7. Create Sale record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId,
          customerName: dto.customerName || (customerId ? 'Registered Customer' : 'Walk-in Customer'),
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          subtotal: rawSubtotal.toNumber(),
          discountTotal: totalDiscount.toNumber(),
          appliedCoupon: validatedCouponCode,
          taxRatePercent,
          taxTotal: taxTotal.toNumber(),
          grandTotal: grandTotal.toNumber(),
          paymentMethod: dto.paymentMethod,
          amountReceived: dto.amountReceived ? Number(dto.amountReceived) : grandTotal.toNumber(),
          changeGiven: changeGiven.toNumber(),
          transactionReference: dto.transactionReference,
          status: SaleStatus.Completed,
          cashierName,
          notes: dto.notes,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      // 8. Create Sale Items and deduct stock atomically
      for (const item of preparedSaleItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            variantId: item.variantId,
            variantSku: item.variantSku,
            productName: item.productName,
            brand: item.brand,
            colorName: item.colorName,
            size: item.size,
            unitPrice: item.unitPrice.toNumber(),
            quantity: item.quantity,
            discount: item.discount.toNumber(),
            taxableAmount: item.taxableAmount.toNumber(),
            total: item.total.toNumber(),
          },
        });

        // Deduct inventory balance
        const prevStock = item.variantRef.stockOnHand;
        const newStock = prevStock - item.quantity;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockOnHand: newStock },
        });

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            variantSku: item.variantSku,
            productName: item.productName,
            movementType: StockMovementType.sale,
            quantityDelta: -item.quantity,
            previousStock: prevStock,
            newStock,
            referenceType: 'sale',
            referenceId: invoiceNumber,
            reason: `In-Store POS Sale (Receipt: ${invoiceNumber})`,
            performedBy: cashierName,
          },
        });
      }

      // 9. Record coupon redemption
      if (validatedCouponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: validatedCouponCode } });
        if (coupon) {
          await tx.couponRedemption.create({
            data: {
              couponId: coupon.id,
              saleId: sale.id,
              customerId,
              customerPhone: dto.customerPhone,
              discountAmount: couponDiscount.toNumber(),
            },
          });
        }
      }

      // 10. Update Customer visit stats
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalVisits: { increment: 1 },
            totalSpent: { increment: grandTotal.toNumber() },
          },
        });
      }

      // 11. Audit log
      await tx.auditLog.create({
        data: {
          actorName: cashierName,
          actorRole: 'Cashier',
          action: 'SALE',
          entity: 'Sale',
          entityId: sale.id,
          summary: `Completed sale ${invoiceNumber} for ₹${grandTotal.toFixed(2)} (${dto.paymentMethod})`,
        },
      });

      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: { items: true },
      });

      return this.mapSale(fullSale);
    });
  }

  async processReturn(saleId: string, dto: ProcessReturnDto, processedBy: string = 'Store Staff') {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one return line item must be specified.');
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) {
        throw new NotFoundException(`Sale with ID ${saleId} not found.`);
      }

      if (sale.status === SaleStatus.Refunded || sale.status === SaleStatus.Cancelled) {
        throw new BadRequestException(`Cannot process return for sale with status "${sale.status}".`);
      }

      const returnNumber = await this.generateReturnNumber(tx);
      let totalRefund = new Decimal(0);
      const returnLinesData = [];

      for (const itemDto of dto.items) {
        const saleItem = sale.items.find((si) => si.id === itemDto.saleItemId);
        if (!saleItem) {
          throw new NotFoundException(`Sale item ${itemDto.saleItemId} not found on this invoice.`);
        }

        const remainingReturnable = saleItem.quantity - saleItem.returnedQuantity;
        if (itemDto.returnedQuantity > remainingReturnable) {
          throw new BadRequestException(
            `Invalid returned quantity for "${saleItem.productName}". Maximum returnable: ${remainingReturnable}, Requested: ${itemDto.returnedQuantity}`,
          );
        }

        const unitPrice = new Decimal(saleItem.unitPrice.toString());
        const refundAmount = unitPrice.times(itemDto.returnedQuantity);
        totalRefund = totalRefund.plus(refundAmount);

        // Update returned quantity on saleItem
        await tx.saleItem.update({
          where: { id: saleItem.id },
          data: {
            returnedQuantity: { increment: itemDto.returnedQuantity },
          },
        });

        // Restock inventory if specified
        if (itemDto.restockStock !== false) {
          const variant = await tx.productVariant.findUnique({ where: { id: saleItem.variantId } });
          if (variant) {
            const prevStock = variant.stockOnHand;
            const newStock = prevStock + itemDto.returnedQuantity;

            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stockOnHand: newStock },
            });

            await tx.stockMovement.create({
              data: {
                variantId: variant.id,
                variantSku: variant.variantSku,
                productName: saleItem.productName,
                movementType: StockMovementType.return,
                quantityDelta: itemDto.returnedQuantity,
                previousStock: prevStock,
                newStock,
                referenceType: 'sale',
                referenceId: returnNumber,
                reason: `Customer return (${itemDto.reason}) from invoice ${sale.invoiceNumber}`,
                performedBy: processedBy,
              },
            });
          }
        }

        returnLinesData.push({
          saleItemId: saleItem.id,
          variantId: saleItem.variantId,
          productName: saleItem.productName,
          variantSku: saleItem.variantSku,
          returnedQuantity: itemDto.returnedQuantity,
          unitPrice: unitPrice.toNumber(),
          refundAmount: refundAmount.toNumber(),
          restockStock: itemDto.restockStock !== false,
          reason: itemDto.reason,
        });
      }

      // Check if all items on sale are now fully returned
      const updatedSaleItems = await tx.saleItem.findMany({ where: { saleId } });
      const allFullyReturned = updatedSaleItems.every((si) => si.returnedQuantity >= si.quantity);

      await tx.sale.update({
        where: { id: saleId },
        data: {
          status: allFullyReturned ? SaleStatus.Refunded : SaleStatus.Partially_Refunded,
        },
      });

      // Create return record
      const saleReturn = await tx.saleReturn.create({
        data: {
          returnNumber,
          saleId: sale.id,
          invoiceNumber: sale.invoiceNumber,
          customerName: sale.customerName || 'Customer',
          refundMethod: dto.refundMethod,
          totalRefund: totalRefund.toNumber(),
          processedBy,
          items: {
            create: returnLinesData,
          },
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          actorName: processedBy,
          actorRole: 'Cashier / Manager',
          action: 'UPDATE',
          entity: 'Sale',
          entityId: sale.id,
          summary: `Processed return ${returnNumber} for invoice ${sale.invoiceNumber} (Refund: ₹${totalRefund.toFixed(2)})`,
        },
      });

      return saleReturn;
    });
  }

  async findAll(params: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    date?: string;
  }) {
    const where: any = {};

    if (params.status && params.status !== 'all') {
      where.status = params.status as SaleStatus;
    }

    if (params.paymentMethod && params.paymentMethod !== 'all') {
      where.paymentMethod = params.paymentMethod as PaymentMethod;
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q } },
      ];
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((s) => this.mapSale(s));
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        returns: { include: { items: true } },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found.`);
    }

    return this.mapSale(sale);
  }

  async getReceipt(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found.`);
    }

    const settings = await this.prisma.storeSetting.findUnique({ where: { id: 'default' } });

    return {
      storeName: settings?.storeName || 'OcuSphere Eyewear Flagship',
      tagline: settings?.tagline,
      address: settings?.address,
      phone: settings?.phone,
      gstin: settings?.gstin,
      receiptHeader: settings?.receiptHeader,
      receiptFooter: settings?.receiptFooter,
      invoiceNumber: sale.invoiceNumber,
      date: sale.createdAt,
      cashierName: sale.cashierName,
      customer: {
        name: sale.customerName,
        phone: sale.customerPhone,
        email: sale.customerEmail,
      },
      items: sale.items.map((i) => ({
        productName: i.productName,
        sku: i.variantSku,
        colorSize: `${i.colorName} / ${i.size}`,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        total: Number(i.total),
      })),
      financials: {
        subtotal: Number(sale.subtotal),
        discountTotal: Number(sale.discountTotal),
        appliedCoupon: sale.appliedCoupon,
        taxRatePercent: Number(sale.taxRatePercent),
        taxTotal: Number(sale.taxTotal),
        grandTotal: Number(sale.grandTotal),
        paymentMethod: sale.paymentMethod,
        amountReceived: sale.amountReceived ? Number(sale.amountReceived) : undefined,
        changeGiven: sale.changeGiven ? Number(sale.changeGiven) : undefined,
      },
    };
  }

  async listReturns() {
    return this.prisma.saleReturn.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private mapSale(s: any) {
    return {
      ...s,
      subtotal: Number(s.subtotal),
      discountTotal: Number(s.discountTotal),
      taxRatePercent: Number(s.taxRatePercent),
      taxTotal: Number(s.taxTotal),
      grandTotal: Number(s.grandTotal),
      amountReceived: s.amountReceived ? Number(s.amountReceived) : undefined,
      changeGiven: s.changeGiven ? Number(s.changeGiven) : undefined,
      items: s.items
        ? s.items.map((i: any) => ({
            ...i,
            unitPrice: Number(i.unitPrice),
            discount: Number(i.discount),
            taxableAmount: Number(i.taxableAmount),
            total: Number(i.total),
          }))
        : [],
    };
  }
}
