import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StockAdjustmentDto, AdjustmentType } from './dto/stock-adjustment.dto';
import { CreateStockRequestDto } from './dto/stock-request.dto';
import { CreateStocktakeDto, CompleteStocktakeDto } from './dto/stocktake.dto';
import { StockMovementType, StockRequestStatus } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getBalances(params: {
    search?: string;
    lowStockOnly?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { variantSku: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, variants] = await Promise.all([
      this.prisma.productVariant.count({ where }),
      this.prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              productType: true,
              modelCode: true,
            },
          },
        },
        orderBy: { stockOnHand: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);

    const formatted = variants.map((v) => {
      const availableQuantity = Math.max(0, v.stockOnHand - v.reservedQuantity);
      const isLowStock = v.stockOnHand <= v.reorderLevel;
      return {
        id: v.id,
        variantId: v.id,
        productId: v.productId,
        productName: v.product.name,
        brand: v.product.brand,
        category: v.product.category,
        productType: v.product.productType,
        modelCode: v.product.modelCode,
        variantSku: v.variantSku,
        barcode: v.barcode,
        colorName: v.colorName,
        size: v.size,
        sellingPrice: Number(v.sellingPrice),
        costPrice: Number(v.costPrice),
        stockOnHand: v.stockOnHand,
        reservedQuantity: v.reservedQuantity,
        availableQuantity,
        reorderLevel: v.reorderLevel,
        isLowStock,
        status: isLowStock ? 'Low Stock' : v.stockOnHand === 0 ? 'Out of Stock' : 'In Stock',
      };
    });

    const items = params.lowStockOnly ? formatted.filter((f) => f.isLowStock) : formatted;

    return {
      items,
      total: params.lowStockOnly ? items.length : total,
      page,
      pageSize,
      totalPages: Math.ceil((params.lowStockOnly ? items.length : total) / pageSize) || 1,
    };
  }

  async getVariantBalance(variantId: string) {
    const v = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!v) {
      throw new NotFoundException(`Variant with ID ${variantId} not found.`);
    }

    const availableQuantity = Math.max(0, v.stockOnHand - v.reservedQuantity);
    return {
      ...v,
      sellingPrice: Number(v.sellingPrice),
      costPrice: Number(v.costPrice),
      availableQuantity,
      isLowStock: v.stockOnHand <= v.reorderLevel,
    };
  }

  async getMovements(params: {
    variantId?: string;
    movementType?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 25));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.variantId) where.variantId = params.variantId;
    if (params.movementType && params.movementType !== 'all') {
      where.movementType = params.movementType as StockMovementType;
    }
    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { variantSku: { contains: q, mode: 'insensitive' } },
        { productName: { contains: q, mode: 'insensitive' } },
        { referenceId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async adjustStock(dto: StockAdjustmentDto, performedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: dto.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant ${dto.variantId} not found.`);
      }

      const prevStock = variant.stockOnHand;
      let newStock = prevStock;
      let delta = 0;
      let movementType: StockMovementType = StockMovementType.adjustment_in;

      if (dto.adjustmentType === AdjustmentType.ADD) {
        delta = dto.quantity;
        newStock = prevStock + dto.quantity;
        movementType = StockMovementType.adjustment_in;
      } else if (dto.adjustmentType === AdjustmentType.SUBTRACT) {
        if (prevStock - dto.quantity < 0) {
          throw new BadRequestException(
            `Insufficient physical inventory: cannot subtract ${dto.quantity} from current stock of ${prevStock}.`,
          );
        }
        delta = -dto.quantity;
        newStock = prevStock - dto.quantity;
        movementType = StockMovementType.adjustment_out;
      } else if (dto.adjustmentType === AdjustmentType.SET) {
        if (dto.quantity < 0) {
          throw new BadRequestException('Target inventory level cannot be negative.');
        }
        delta = dto.quantity - prevStock;
        newStock = dto.quantity;
        movementType = delta >= 0 ? StockMovementType.adjustment_in : StockMovementType.adjustment_out;
      }

      // Update variant stockOnHand atomically
      const updatedVariant = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stockOnHand: newStock },
      });

      // Record authoritative movement
      const refId = `ADJ-${Date.now()}`;
      const movement = await tx.stockMovement.create({
        data: {
          variantId: variant.id,
          variantSku: variant.variantSku,
          productName: variant.product.name,
          movementType,
          quantityDelta: delta,
          previousStock: prevStock,
          newStock,
          referenceType: 'adjustment',
          referenceId: refId,
          reason: `${dto.reason}: ${dto.notes || 'Manual stock adjustment'}`,
          performedBy,
        },
      });

      // Record adjustment entry
      await tx.stockAdjustment.create({
        data: {
          variantId: variant.id,
          variantSku: variant.variantSku,
          adjustmentType: dto.adjustmentType,
          quantity: dto.quantity,
          reason: dto.reason,
          notes: dto.notes,
          performedBy,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorName: performedBy,
          actorRole: 'Inventory',
          action: 'ADJUST',
          entity: 'Inventory',
          entityId: variant.id,
          summary: `Stock adjustment (${dto.adjustmentType} ${dto.quantity}) for ${variant.variantSku}. Balance: ${prevStock} -> ${newStock}`,
        },
      });

      return {
        variant: updatedVariant,
        movement,
      };
    });
  }

  async createStocktake(dto: CreateStocktakeDto, auditedBy: string) {
    const reference = `ST-${Date.now().toString().slice(-6)}`;

    return this.prisma.$transaction(async (tx) => {
      let totalVarianceCount = 0;
      let totalVarianceValue = 0;

      const itemsData = [];
      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (variant) {
          const systemStock = variant.stockOnHand;
          const variance = item.countedStock - systemStock;
          const unitCost = Number(variant.costPrice);
          totalVarianceCount += Math.abs(variance);
          totalVarianceValue += Math.abs(variance) * unitCost;

          itemsData.push({
            variantId: variant.id,
            variantSku: variant.variantSku,
            productName: variant.product.name,
            systemStock,
            countedStock: item.countedStock,
            variance,
            unitCost,
          });
        }
      }

      const session = await tx.stocktakeSession.create({
        data: {
          reference,
          categoryOrBrand: dto.categoryOrBrand,
          auditedBy,
          status: 'In Progress',
          totalVarianceCount,
          totalVarianceValue,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });

      return session;
    });
  }

  async listStocktakes() {
    return this.prisma.stocktakeSession.findMany({
      include: { items: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  async completeStocktake(id: string, dto: CompleteStocktakeDto, actorName: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.stocktakeSession.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!session) {
        throw new NotFoundException(`Stocktake session ${id} not found.`);
      }

      if (session.status === 'Completed' || session.status === 'Reconciled') {
        throw new BadRequestException('Stocktake session has already been finalized.');
      }

      if (dto.reconcileInventory) {
        for (const item of session.items) {
          if (item.variance !== 0) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockOnHand: item.countedStock },
            });

            await tx.stockMovement.create({
              data: {
                variantId: item.variantId,
                variantSku: item.variantSku,
                productName: item.productName,
                movementType:
                  item.variance > 0
                    ? StockMovementType.adjustment_in
                    : StockMovementType.adjustment_out,
                quantityDelta: item.variance,
                previousStock: item.systemStock,
                newStock: item.countedStock,
                referenceType: 'stocktake',
                referenceId: session.reference,
                reason: `Cycle count reconciliation variance (${item.variance})`,
                performedBy: actorName,
              },
            });
          }
        }
      }

      const updated = await tx.stocktakeSession.update({
        where: { id },
        data: {
          status: dto.reconcileInventory ? 'Reconciled' : 'Completed',
          completedAt: new Date(),
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          actorName,
          actorRole: 'Inventory Manager',
          action: 'APPROVE',
          entity: 'Inventory',
          entityId: id,
          summary: `Completed stocktake ${session.reference} (Status: ${updated.status})`,
        },
      });

      return updated;
    });
  }

  async listStockRequests() {
    return this.prisma.stockRequest.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStockRequest(dto: CreateStockRequestDto, requestedBy: string) {
    const requestNumber = `REQ-${Date.now().toString().slice(-6)}`;

    const itemsData = [];
    for (const item of dto.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });
      if (variant) {
        itemsData.push({
          variantId: variant.id,
          variantSku: variant.variantSku,
          productName: variant.product.name,
          currentStock: variant.stockOnHand,
          requestedQuantity: item.requestedQuantity,
          estimatedCost: item.estimatedCost || Number(variant.costPrice) * item.requestedQuantity,
        });
      }
    }

    return this.prisma.stockRequest.create({
      data: {
        requestNumber,
        requestedBy,
        urgency: dto.urgency || 'Standard',
        notes: dto.notes,
        status: StockRequestStatus.Submitted,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });
  }

  async approveStockRequest(
    id: string,
    approvedBy: string,
    approverNotes?: string,
  ) {
    const req = await this.prisma.stockRequest.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!req) {
      throw new NotFoundException(`Stock request ${id} not found.`);
    }

    return this.prisma.stockRequest.update({
      where: { id },
      data: {
        status: StockRequestStatus.Approved,
        approvedBy,
        approverNotes,
      },
      include: { items: true },
    });
  }
}
