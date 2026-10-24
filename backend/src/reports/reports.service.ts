import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SaleStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      salesAgg,
      totalOrders,
      activeProducts,
      pendingBookings,
      totalCustomers,
      variants,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { status: { in: [SaleStatus.Completed, SaleStatus.Partially_Refunded] } },
        _sum: { grandTotal: true, discountTotal: true, taxTotal: true },
      }),
      this.prisma.sale.count({
        where: { status: { in: [SaleStatus.Completed, SaleStatus.Partially_Refunded] } },
      }),
      this.prisma.product.count({ where: { status: 'published' } }),
      this.prisma.booking.count({
        where: { status: { in: [BookingStatus.Pending, BookingStatus.Confirmed, BookingStatus.Arrived] } },
      }),
      this.prisma.customer.count(),
      this.prisma.productVariant.findMany({
        select: { stockOnHand: true, reorderLevel: true, costPrice: true, sellingPrice: true },
      }),
    ]);

    const totalRevenue = salesAgg._sum.grandTotal ? Number(salesAgg._sum.grandTotal) : 0;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    let lowStockCount = 0;
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;

    for (const v of variants) {
      if (v.stockOnHand <= v.reorderLevel) lowStockCount++;
      inventoryCostValue += v.stockOnHand * Number(v.costPrice);
      inventoryRetailValue += v.stockOnHand * Number(v.sellingPrice);
    }

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      activeProducts,
      totalCustomers,
      lowStockCount,
      pendingBookings,
      inventoryValuation: {
        costValue: Math.round(inventoryCostValue),
        retailValue: Math.round(inventoryRetailValue),
        potentialProfit: Math.round(inventoryRetailValue - inventoryCostValue),
      },
    };
  }

  async getSalesReport(params?: { startDate?: string; endDate?: string }) {
    const where: any = {
      status: { in: [SaleStatus.Completed, SaleStatus.Partially_Refunded] },
    };

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const sales = await this.prisma.sale.findMany({
      where,
      select: {
        id: true,
        invoiceNumber: true,
        grandTotal: true,
        paymentMethod: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const paymentMethodBreakdown: Record<string, { count: number; total: number }> = {};
    for (const s of sales) {
      const pm = s.paymentMethod;
      if (!paymentMethodBreakdown[pm]) {
        paymentMethodBreakdown[pm] = { count: 0, total: 0 };
      }
      paymentMethodBreakdown[pm].count += 1;
      paymentMethodBreakdown[pm].total += Number(s.grandTotal);
    }

    return {
      salesCount: sales.length,
      totalRevenue: sales.reduce((acc, s) => acc + Number(s.grandTotal), 0),
      paymentMethodBreakdown,
      recentSales: sales.slice(0, 15).map((s) => ({
        ...s,
        grandTotal: Number(s.grandTotal),
      })),
    };
  }

  async getInventoryReport() {
    const variants = await this.prisma.productVariant.findMany({
      include: { product: true },
      orderBy: { stockOnHand: 'asc' },
    });

    const lowStockItems = variants
      .filter((v) => v.stockOnHand <= v.reorderLevel)
      .map((v) => ({
        variantId: v.id,
        variantSku: v.variantSku,
        productName: v.product.name,
        brand: v.product.brand,
        stockOnHand: v.stockOnHand,
        reorderLevel: v.reorderLevel,
        unitCost: Number(v.costPrice),
      }));

    return {
      totalVariants: variants.length,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    };
  }
}
