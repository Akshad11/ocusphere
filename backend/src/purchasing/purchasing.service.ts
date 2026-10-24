import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { PurchaseOrderStatus, StockMovementType } from '@prisma/client';
import { Decimal } from 'decimal.js';

@Injectable()
export class PurchasingService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.purchaseOrder.count();
    const seq = (count + 1).toString().padStart(4, '0');
    return `PO-${year}-${seq}`;
  }

  private async generateReceiptNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.goodsReceipt.count();
    const seq = (count + 1).toString().padStart(4, '0');
    return `GRN-${year}-${seq}`;
  }

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, createdByName: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('A purchase order must include at least one item.');
    }

    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException(`Supplier ${dto.supplierId} not found.`);

    return this.prisma.$transaction(async (tx) => {
      const orderNumber = await this.generateOrderNumber(tx);

      let subtotal = new Decimal(0);
      const itemsData = [];

      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found.`);

        const unitCost = new Decimal(item.unitCost);
        const qty = new Decimal(item.orderedQuantity);
        const total = unitCost.times(qty);
        subtotal = subtotal.plus(total);

        itemsData.push({
          variantId: variant.id,
          variantSku: variant.variantSku,
          productName: variant.product.name,
          orderedQuantity: item.orderedQuantity,
          unitCost: unitCost.toNumber(),
          totalCost: total.toNumber(),
        });
      }

      const taxAmount = subtotal.times(0.12).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const totalCost = subtotal.plus(taxAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          supplierId: supplier.id,
          supplierName: supplier.businessName,
          status: PurchaseOrderStatus.Draft,
          expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
          subtotal: subtotal.toNumber(),
          taxAmount: taxAmount.toNumber(),
          totalCost: totalCost.toNumber(),
          notes: dto.notes,
          createdByName,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          actorName: createdByName,
          actorRole: 'Procurement',
          action: 'CREATE',
          entity: 'PurchaseOrder',
          entityId: po.id,
          summary: `Created purchase order ${orderNumber} for ${supplier.businessName} (₹${totalCost.toFixed(2)})`,
        },
      });

      return this.mapPurchaseOrder(po);
    });
  }

  async listPurchaseOrders(params: { search?: string; status?: string }) {
    const where: any = {};
    if (params.status && params.status !== 'all') {
      where.status = params.status as PurchaseOrderStatus;
    }
    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { supplierName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const pos = await this.prisma.purchaseOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return pos.map((po) => this.mapPurchaseOrder(po));
  }

  async getPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
        goodsReceipts: { include: { items: true } },
      },
    });

    if (!po) throw new NotFoundException(`Purchase Order ${id} not found.`);
    return this.mapPurchaseOrder(po);
  }

  async submitPurchaseOrder(id: string, actorName: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException(`Purchase Order ${id} not found.`);

    if (po.status !== PurchaseOrderStatus.Draft) {
      throw new BadRequestException(`Cannot submit purchase order with status "${po.status}".`);
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.Sent },
      include: { items: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Procurement Manager',
        action: 'UPDATE',
        entity: 'PurchaseOrder',
        entityId: id,
        summary: `Submitted purchase order ${po.orderNumber} to vendor ${po.supplierName}`,
      },
    });

    return this.mapPurchaseOrder(updated);
  }

  async createGoodsReceipt(dto: CreateGoodsReceiptDto, receivedBy: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one goods receipt item must be provided.');
    }

    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
        include: { items: true },
      });

      if (!po) {
        throw new NotFoundException(`Purchase order ${dto.purchaseOrderId} not found.`);
      }

      if (po.status === PurchaseOrderStatus.Received || po.status === PurchaseOrderStatus.Cancelled) {
        throw new BadRequestException(`Cannot process receipt for PO with status "${po.status}".`);
      }

      const receiptNumber = await this.generateReceiptNumber(tx);
      const receiptLinesData = [];

      for (const itemDto of dto.items) {
        const poItem = po.items.find((i) => i.id === itemDto.purchaseOrderItemId);
        if (!poItem) {
          throw new NotFoundException(`PO item ${itemDto.purchaseOrderItemId} not found on this order.`);
        }

        const remainingToReceive = poItem.orderedQuantity - poItem.receivedQuantity;
        if (itemDto.receivedNow > remainingToReceive) {
          throw new BadRequestException(
            `Receipt quantity (${itemDto.receivedNow}) exceeds remaining pending quantity (${remainingToReceive}) for ${poItem.productName}.`,
          );
        }

        const variant = await tx.productVariant.findUnique({
          where: { id: poItem.variantId },
        });

        if (!variant) throw new NotFoundException(`Variant ${poItem.variantId} not found.`);

        // Protect from duplicate stock additions: update receivedQuantity and stock atomically
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: {
            receivedQuantity: { increment: itemDto.receivedNow },
          },
        });

        const prevStock = variant.stockOnHand;
        const newStock = prevStock + itemDto.receivedNow;

        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stockOnHand: newStock },
        });

        // Record stock inward movement
        await tx.stockMovement.create({
          data: {
            variantId: variant.id,
            variantSku: variant.variantSku,
            productName: poItem.productName,
            movementType: StockMovementType.purchase_receipt,
            quantityDelta: itemDto.receivedNow,
            previousStock: prevStock,
            newStock,
            referenceType: 'po',
            referenceId: receiptNumber,
            reason: `Goods receipt from PO ${po.orderNumber} (Supplier: ${po.supplierName})`,
            performedBy: receivedBy,
          },
        });

        receiptLinesData.push({
          purchaseOrderItemId: poItem.id,
          variantId: poItem.variantId,
          variantSku: poItem.variantSku,
          productName: poItem.productName,
          orderedQuantity: poItem.orderedQuantity,
          previouslyReceived: poItem.receivedQuantity,
          receivedNow: itemDto.receivedNow,
          damagedOrMissing: itemDto.damagedOrMissing || 0,
          unitCost: Number(poItem.unitCost),
        });
      }

      // Check if PO is now fully received
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
      });
      const allFullyReceived = updatedPoItems.every((i) => i.receivedQuantity >= i.orderedQuantity);

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: allFullyReceived ? PurchaseOrderStatus.Received : PurchaseOrderStatus.Partially_Received,
        },
      });

      const receipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId: po.id,
          orderNumber: po.orderNumber,
          supplierName: po.supplierName,
          deliveryNoteNumber: dto.deliveryNoteNumber,
          receivedDate: new Date(),
          receivedBy,
          notes: dto.notes,
          items: {
            create: receiptLinesData,
          },
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          actorName: receivedBy,
          actorRole: 'Inventory Staff',
          action: 'RECEIPT',
          entity: 'PurchaseOrder',
          entityId: receipt.id,
          summary: `Inward goods receipt ${receiptNumber} processed against PO ${po.orderNumber}`,
        },
      });

      return receipt;
    });
  }

  async listGoodsReceipts() {
    return this.prisma.goodsReceipt.findMany({
      include: { items: true },
      orderBy: { receivedDate: 'desc' },
    });
  }

  async getGoodsReceipt(id: string) {
    const gr = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!gr) throw new NotFoundException(`Goods receipt ${id} not found.`);
    return gr;
  }

  private mapPurchaseOrder(po: any) {
    return {
      ...po,
      subtotal: Number(po.subtotal),
      taxAmount: Number(po.taxAmount),
      totalCost: Number(po.totalCost),
      items: po.items
        ? po.items.map((i: any) => ({
            ...i,
            unitCost: Number(i.unitCost),
            totalCost: Number(i.totalCost),
          }))
        : [],
    };
  }
}
