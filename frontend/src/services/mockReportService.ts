import { mockStore, simulateNetwork } from './mockApiClient';

export interface SalesReportSummary {
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
  totalTax: number;
  totalDiscounts: number;
  salesByCategory: Record<string, number>;
  salesByPaymentMethod: Record<string, number>;
}

export interface InventoryValuationSummary {
  totalSkus: number;
  totalUnitsOnHand: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialGrossProfit: number;
  grossMarginPercent: number;
}

export interface ReportService {
  getSalesSummary(startDate?: string, endDate?: string): Promise<SalesReportSummary>;
  getInventoryValuation(): Promise<InventoryValuationSummary>;
  getTopSellingProducts(limit?: number): Promise<Array<{
    productName: string;
    brand: string;
    unitsSold: number;
    revenue: number;
  }>>;
  getBookingStats(): Promise<{
    totalBookings: number;
    appointments: number;
    reservations: number;
    completed: number;
    cancelled: number;
    readyForPickup: number;
  }>;
}

class MockReportServiceImpl implements ReportService {
  async getSalesSummary(startDate?: string, endDate?: string): Promise<SalesReportSummary> {
    let sales = [...mockStore.sales].filter((s) => s.status === 'Completed');

    if (startDate) {
      sales = sales.filter((s) => s.createdAt >= startDate);
    }
    if (endDate) {
      sales = sales.filter((s) => s.createdAt <= endDate);
    }

    const totalRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
    const transactionCount = sales.length;
    const averageOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;
    const totalTax = sales.reduce((acc, s) => acc + s.taxTotal, 0);
    const totalDiscounts = sales.reduce((acc, s) => acc + s.discountTotal, 0);

    const salesByCategory: Record<string, number> = {};
    const salesByPaymentMethod: Record<string, number> = {};

    sales.forEach((s) => {
      // Payment method breakdown
      salesByPaymentMethod[s.paymentMethod] = (salesByPaymentMethod[s.paymentMethod] || 0) + s.grandTotal;

      // Category breakdown
      s.items.forEach((item) => {
        // Find product category
        let cat = 'Eyewear';
        for (const p of mockStore.products) {
          if (p.variants.some((v) => v.id === item.variantId)) {
            cat = p.productType;
            break;
          }
        }
        salesByCategory[cat] = (salesByCategory[cat] || 0) + item.total;
      });
    });

    return simulateNetwork({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      transactionCount,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalDiscounts: parseFloat(totalDiscounts.toFixed(2)),
      salesByCategory,
      salesByPaymentMethod,
    });
  }

  async getInventoryValuation(): Promise<InventoryValuationSummary> {
    let totalSkus = 0;
    let totalUnitsOnHand = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;

    mockStore.products.forEach((p) => {
      p.variants.forEach((v) => {
        totalSkus += 1;
        totalUnitsOnHand += v.stockOnHand;
        totalCostValue += v.stockOnHand * v.costPrice;
        totalRetailValue += v.stockOnHand * v.sellingPrice;
      });
    });

    const potentialGrossProfit = totalRetailValue - totalCostValue;
    const grossMarginPercent = totalRetailValue > 0 ? (potentialGrossProfit / totalRetailValue) * 100 : 0;

    return simulateNetwork({
      totalSkus,
      totalUnitsOnHand,
      totalCostValue: parseFloat(totalCostValue.toFixed(2)),
      totalRetailValue: parseFloat(totalRetailValue.toFixed(2)),
      potentialGrossProfit: parseFloat(potentialGrossProfit.toFixed(2)),
      grossMarginPercent: parseFloat(grossMarginPercent.toFixed(1)),
    });
  }

  async getTopSellingProducts(limit: number = 5): Promise<Array<{ productName: string; brand: string; unitsSold: number; revenue: number }>> {
    const map = new Map<string, { productName: string; brand: string; unitsSold: number; revenue: number }>();

    mockStore.sales
      .filter((s) => s.status === 'Completed')
      .forEach((s) => {
        s.items.forEach((item) => {
          const existing = map.get(item.productName) || {
            productName: item.productName,
            brand: item.brand,
            unitsSold: 0,
            revenue: 0,
          };
          existing.unitsSold += item.quantity;
          existing.revenue += item.total;
          map.set(item.productName, existing);
        });
      });

    const sorted = Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return simulateNetwork(sorted);
  }

  async getBookingStats() {
    const list = mockStore.bookings;
    const totalBookings = list.length;
    const appointments = list.filter((b) => b.bookingType === 'appointment').length;
    const reservations = list.filter((b) => b.bookingType === 'reservation').length;
    const completed = list.filter((b) => b.status === 'Completed' || b.status === 'Collected').length;
    const cancelled = list.filter((b) => b.status === 'Cancelled' || b.status === 'Expired').length;
    const readyForPickup = list.filter((b) => b.status === 'Ready for pickup').length;

    return simulateNetwork({
      totalBookings,
      appointments,
      reservations,
      completed,
      cancelled,
      readyForPickup,
    });
  }
}

import { apiReportService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockReportService: ReportService = isMock ? new MockReportServiceImpl() : (apiReportService as any);
