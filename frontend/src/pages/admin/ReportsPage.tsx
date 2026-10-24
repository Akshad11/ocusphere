import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, Users, Package, Eye, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { mockReportService, SalesReportSummary, InventoryValuationSummary } from '../../services/mockReportService';
import { exportToCsv } from '../../utils/exportCsv';

export const ReportsPage: React.FC = () => {
  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);
  const [inventoryVal, setInventoryVal] = useState<InventoryValuationSummary | null>(null);
  const [topProducts, setTopProducts] = useState<Array<{ productName: string; brand: string; unitsSold: number; revenue: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    Promise.all([
      mockReportService.getSalesSummary(),
      mockReportService.getInventoryValuation(),
      mockReportService.getTopSellingProducts(5),
    ]).then(([sales, inv, top]) => {
      setSalesSummary(sales);
      setInventoryVal(inv);
      setTopProducts(top);
      setLoading(false);
    });
  }, [dateRange]);

  const handleExportSales = () => {
    if (!salesSummary) return;
    const rows = Object.entries(salesSummary.salesByCategory).map(([category, revenue]) => ({
      Category: category,
      Revenue: revenue,
      TotalShare: `${((revenue / (salesSummary.totalRevenue || 1)) * 100).toFixed(1)}%`,
    }));
    exportToCsv('ocu-sphere-sales-category-report', rows);
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 text-center">Loading retail analytics...</div>;
  }

  const categoryEntries = salesSummary ? Object.entries(salesSummary.salesByCategory) : [];
  const paymentEntries = salesSummary ? Object.entries(salesSummary.salesByPaymentMethod) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Reports & Retail Intelligence</h1>
          <p className="text-sm text-neutral-500">
            Revenue trends, optometrist examination conversions, lens category margins, and payment method splits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last Quarter' },
              { value: 'ytd', label: 'Year to Date (FY26)' },
            ]}
          />
          <Button variant="outline" size="sm" onClick={handleExportSales}>
            <Download className="w-4 h-4 mr-1.5" /> Export Report CSV
          </Button>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Gross Revenue</span>
          <div className="text-2xl font-bold text-neutral-900">
            <CurrencyDisplay amount={salesSummary?.totalRevenue || 0} />
          </div>
          <span className="text-xs text-emerald-600 font-semibold font-mono">
            Discounts: ₹{salesSummary?.totalDiscounts?.toLocaleString('en-IN') || 0}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Transactions</span>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {salesSummary?.transactionCount || 0}
          </div>
          <span className="text-xs text-neutral-400">
            Avg Order: ₹{Math.round(salesSummary?.averageOrderValue || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Inventory Retail Value</span>
          <div className="text-2xl font-bold text-neutral-900">
            <CurrencyDisplay amount={inventoryVal?.totalRetailValue || 0} />
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {inventoryVal?.totalUnitsOnHand || 0} units on hand
          </span>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Gross Margin Potential</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {inventoryVal?.grossMarginPercent || 0}%
          </div>
          <span className="text-xs text-neutral-400">Cost: ₹{Math.round(inventoryVal?.totalCostValue || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Grid: Category Sales + Payment Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Revenue by Product Category
          </h2>

          <div className="space-y-3">
            {categoryEntries.map(([cat, rev]) => {
              const pct = salesSummary?.totalRevenue ? Math.round((rev / salesSummary.totalRevenue) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-900">{cat}</span>
                    <div className="space-x-3 font-mono">
                      <strong className="text-neutral-900">₹{rev.toLocaleString('en-IN')} ({pct}%)</strong>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 overflow-hidden">
                    <div className="bg-neutral-900 h-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Channels Split */}
        <div className="bg-white border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Tender Settlement Breakdown
          </h2>

          <div className="space-y-3">
            {paymentEntries.map(([method, amount]) => {
              const pct = salesSummary?.totalRevenue ? Math.round((amount / salesSummary.totalRevenue) * 100) : 0;
              return (
                <div key={method} className="p-3 border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-neutral-900 block">{method}</span>
                    <span className="text-xs text-neutral-500">{pct}% of total retail volume</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-neutral-900">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Models */}
      <div className="bg-white border border-neutral-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
          Top Performing Eyewear Models
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topProducts.map((p, idx) => (
            <div key={p.productName} className="p-4 border border-neutral-200">
              <span className="text-xs text-neutral-400 font-mono block">RANK #{idx + 1}</span>
              <h3 className="font-bold text-neutral-900">{p.productName}</h3>
              <p className="text-xs text-neutral-500">{p.brand}</p>
              <div className="mt-2 text-xs space-y-1 text-neutral-600">
                <p>Units Sold: <strong className="font-mono text-neutral-900">{p.unitsSold}</strong></p>
                <p>Gross Value: <strong className="font-mono text-emerald-700">₹{p.revenue.toLocaleString('en-IN')}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
