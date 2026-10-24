import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useSales } from '../../hooks/useSales';
import { DataTable, Column } from '../../components/common/DataTable';
import { SaleReturn } from '../../types/sales.types';
import { formatINR } from '../../utils/currency';
import { formatDateTime } from '../../utils/dates';
import { RotateCcw } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  const { returns, loading } = useSales();

  const columns: Column<SaleReturn>[] = [
    {
      header: 'Return #',
      render: (r) => (
        <span className="font-mono font-bold text-neutral-900">{r.returnNumber}</span>
      ),
    },
    {
      header: 'Original Invoice',
      render: (r) => (
        <span className="font-mono text-neutral-600">{r.invoiceNumber}</span>
      ),
    },
    {
      header: 'Date Processed',
      render: (r) => (
        <span className="font-mono text-xs tabular-nums text-neutral-600">
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
    {
      header: 'Customer',
      render: (r) => <span className="font-medium text-neutral-800">{r.customerName}</span>,
    },
    {
      header: 'Items & Reason',
      render: (r) => (
        <div className="text-xs">
          {r.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="font-semibold text-neutral-900">
                {item.productName} ({item.returnedQuantity}x)
              </span>
              <span className="text-[11px] text-neutral-500 block">
                Reason: {item.reason} {item.restockStock ? '· Restocked to floor' : ''}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Refund Mode',
      render: (r) => <span className="font-mono text-xs">{r.refundMethod}</span>,
    },
    {
      header: 'Refund Amount',
      align: 'right',
      render: (r) => (
        <span className="font-mono font-bold tabular-nums text-rose-700">
          {formatINR(r.totalRefund)}
        </span>
      ),
    },
    {
      header: 'Processed By',
      render: (r) => <span className="text-xs text-neutral-600">{r.processedBy}</span>,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Returns & Refunds"
        subtitle="Audited log of restocked optical goods, defective exchanges, and customer credits."
        breadcrumbs={[
          { label: 'Sales History', path: '/admin/sales' },
          { label: 'Returns' },
        ]}
      />

      <DataTable
        columns={columns}
        data={returns}
        keyExtractor={(r) => r.id}
        isLoading={loading}
        emptyTitle="No returns processed"
        emptyMessage="Any items returned through dispensary sales will be itemized here."
      />
    </div>
  );
};
