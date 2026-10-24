import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useSales } from '../../hooks/useSales';
import { DataTable, Column } from '../../components/common/DataTable';
import { Sale } from '../../types/sales.types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchInput } from '../../components/common/SearchInput';
import { formatINR } from '../../utils/currency';
import { formatDateTime } from '../../utils/dates';
import { exportToCsv } from '../../utils/exportCsv';
import { Button } from '../../components/common/Button';
import { ShoppingCart, Download, Eye, RotateCcw } from 'lucide-react';

export const SalesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const { sales, loading } = useSales({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
  });

  const handleExport = () => {
    const rows = sales.map((s) => ({
      'Invoice Number': s.invoiceNumber,
      'Date': s.createdAt,
      'Customer': s.customer?.name || 'Walk-in Guest',
      'Phone': s.customer?.phone || '',
      'Payment Method': s.paymentMethod,
      'Subtotal (INR)': s.subtotal,
      'Discount (INR)': s.discountTotal,
      'Tax (INR)': s.taxTotal,
      'Grand Total (INR)': s.grandTotal,
      'Status': s.status,
      'Cashier': s.cashierName,
    }));
    exportToCsv('OcuSphere_Sales_Ledger', rows);
  };

  const columns: Column<Sale>[] = [
    {
      header: 'Invoice #',
      render: (s) => (
        <span className="font-mono font-bold text-neutral-900">{s.invoiceNumber}</span>
      ),
    },
    {
      header: 'Date & Time',
      render: (s) => (
        <span className="font-mono text-xs tabular-nums text-neutral-600">
          {formatDateTime(s.createdAt)}
        </span>
      ),
    },
    {
      header: 'Customer',
      render: (s) => (
        <div>
          <span className="font-medium text-neutral-900 block">
            {s.customer ? s.customer.name : 'Walk-in Guest'}
          </span>
          {s.customer?.phone && (
            <span className="text-[11px] font-mono text-neutral-400">{s.customer.phone}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Items',
      render: (s) => (
        <span className="text-xs text-neutral-600">
          {s.items.length} {s.items.length === 1 ? 'item' : 'items'}
        </span>
      ),
    },
    {
      header: 'Mode',
      render: (s) => <span className="font-mono text-xs text-neutral-600">{s.paymentMethod}</span>,
    },
    {
      header: 'Grand Total',
      align: 'right',
      render: (s) => (
        <span className="font-mono font-bold tabular-nums text-neutral-900">
          {formatINR(s.grandTotal)}
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (s) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/sales/${s.id}`);
          }}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="View Invoice & Receipt"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Sales History & Invoices"
        subtitle="Historical transactions, receipt re-issuance, and refund processing."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              icon={<ShoppingCart className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/pos')}
            >
              Open POS
            </Button>
          </>
        }
      />

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-lg">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search invoice #, customer, phone..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="all">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={sales}
        keyExtractor={(s) => s.id}
        isLoading={loading}
        onRowClick={(s) => navigate(`/admin/sales/${s.id}`)}
      />
    </div>
  );
};
