import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { formatINR } from '../../utils/currency';
import { formatDateTime } from '../../utils/dates';
import { mockReportService, SalesReportSummary } from '../../services/mockReportService';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { useBookings } from '../../hooks/useBookings';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import {
  TrendingUp,
  Receipt,
  CalendarCheck,
  PackageOpen,
  AlertTriangle,
  GitPullRequestDraft,
  ShoppingBag,
  Plus,
  ArrowRight,
  Boxes,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { stockRows, requests, movements } = useInventory();
  const { bookings } = useBookings();

  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);
  const [topProducts, setTopProducts] = useState<Array<{ productName: string; brand: string; unitsSold: number; revenue: number }>>([]);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('30days');

  useEffect(() => {
    mockReportService.getSalesSummary().then(setSalesSummary);
    mockReportService.getTopSellingProducts(5).then(setTopProducts);
  }, [sales]);

  // Derived metrics from real store state
  const lowStockCount = stockRows.filter((r) => r.stockStatus === 'Low Stock' || r.stockStatus === 'Out of Stock').length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'Submitted' || r.status === 'Draft').length;
  const readyPickupCount = bookings.filter((b) => b.status === 'Ready for pickup').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Arrived').length;
  const pendingReservationsCount = bookings.filter((b) => b.bookingType === 'reservation' && (b.status === 'Pending' || b.status === 'Preparing')).length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Optical Store Dashboard"
        subtitle="Live retail metrics, dispensary sales, inventory alerts, and appointments."
        actions={
          <>
            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-md p-1 text-xs">
              {(['today', '7days', '30days'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    dateRange === range
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => navigate('/admin/pos')}
              icon={<ShoppingCart className="w-4 h-4" />}
            >
              New POS Sale
            </Button>
          </>
        }
      />

      {/* 4-Column Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue */}
        <div
          onClick={() => navigate('/admin/sales')}
          className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {formatINR(salesSummary?.totalRevenue || 0)}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
              <span>{salesSummary?.transactionCount || 0} completed invoices</span>
              <span className="font-semibold text-neutral-800">
                Avg {formatINR(salesSummary?.averageOrderValue || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Bookings */}
        <div
          onClick={() => navigate('/admin/bookings')}
          className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings</span>
            <CalendarCheck className="w-4 h-4 text-neutral-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {activeBookingsCount}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
              <span>{pendingReservationsCount} hold reservations</span>
              <span className="text-blue-700 font-semibold">{readyPickupCount} ready for pickup</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Low-Stock Products */}
        <div
          onClick={() => navigate('/admin/inventory?status=low_stock')}
          className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Attention</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-400'}`} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {lowStockCount}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
              <span>Below reorder threshold</span>
              <span className="text-amber-800 font-semibold">Action needed</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Stock Requests */}
        <div
          onClick={() => navigate('/admin/stock-requests')}
          className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Requests</span>
            <GitPullRequestDraft className="w-4 h-4 text-neutral-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {pendingRequestsCount}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
              <span>Pending manager review</span>
              <span className="text-neutral-800 font-medium">Review queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-neutral-800">Quick Operations:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors font-medium text-neutral-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Frame</span>
          </Link>
          <Link
            to="/admin/inventory"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors font-medium text-neutral-800"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Adjustment</span>
          </Link>
          <Link
            to="/admin/purchase-orders"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors font-medium text-neutral-800"
          >
            <span>Create Purchase Order</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors font-medium text-neutral-800"
          >
            <span>Dispatch Pickup Orders</span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Transactions + Top Selling Frames */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent Transactions */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Recent Dispensary Invoices</h3>
            </div>
            <Link to="/admin/sales" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900">
              View All Invoices →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 pb-2">
                  <th className="pb-2 font-medium">Invoice</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Mode</th>
                  <th className="pb-2 text-right font-medium">Grand Total</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sales.slice(0, 5).map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => navigate(`/admin/sales/${sale.id}`)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-mono font-bold text-neutral-900">{sale.invoiceNumber}</td>
                    <td className="py-2.5 text-neutral-700">
                      {sale.customer ? sale.customer.name : 'Walk-in Guest'}
                    </td>
                    <td className="py-2.5 text-neutral-500 font-mono">{sale.paymentMethod}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatINR(sale.grandTotal)}
                    </td>
                    <td className="py-2.5 text-right">
                      <StatusBadge status={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5 cols): Top Selling Models & Movements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Top-Selling Models</h3>
              <Link to="/admin/reports" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900">
                Analytics →
              </Link>
            </div>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 block truncate max-w-[200px]">
                      {p.productName}
                    </span>
                    <span className="text-[11px] text-neutral-500">{p.brand}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-neutral-900 tabular-nums block">
                      {formatINR(p.revenue)}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{p.unitsSold} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Stock Movements Feed */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Recent Stock Movements
              </h3>
              <Link to="/admin/inventory/movements" className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900">
                All Logs →
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {movements.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1 border-b border-neutral-50 last:border-0">
                  <div className="truncate pr-2">
                    <span className="font-medium text-neutral-900 block truncate">{m.productName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{m.referenceId || m.performedBy}</span>
                  </div>
                  <span
                    className={`font-mono tabular-nums font-bold shrink-0 ${
                      m.quantityDelta > 0 ? 'text-emerald-700' : 'text-neutral-800'
                    }`}
                  >
                    {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
