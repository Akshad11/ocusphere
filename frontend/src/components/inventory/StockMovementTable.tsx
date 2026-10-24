import React from 'react';
import { StockMovement } from '../../types/inventory.types';
import { DataTable, Column } from '../common/DataTable';
import { formatDateTime } from '../../utils/dates';

export const StockMovementTable: React.FC<{
  movements: StockMovement[];
  isLoading?: boolean;
}> = ({ movements, isLoading }) => {
  const columns: Column<StockMovement>[] = [
    {
      header: 'Date & Time',
      render: (m) => (
        <span className="font-mono text-xs tabular-nums text-neutral-600">
          {formatDateTime(m.timestamp)}
        </span>
      ),
    },
    {
      header: 'Product / SKU',
      render: (m) => (
        <div>
          <span className="font-semibold text-neutral-900 block">{m.productName}</span>
          <span className="text-[11px] font-mono text-neutral-500">{m.variantSku}</span>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      render: (m) => {
        const typeLabels: Record<string, string> = {
          sale: 'Sale Dispatch',
          purchase_receipt: 'PO Inward Receipt',
          adjustment_in: 'Manual Adjust (+)',
          adjustment_out: 'Manual Adjust (-)',
          return: 'Customer Return Restock',
          reservation_hold: 'Hold for Pickup',
          reservation_release: 'Hold Released',
        };
        return (
          <span className="text-xs font-medium text-neutral-700">
            {typeLabels[m.movementType] || m.movementType}
          </span>
        );
      },
    },
    {
      header: 'Delta',
      align: 'right',
      render: (m) => (
        <span
          className={`font-mono font-semibold tabular-nums ${
            m.quantityDelta > 0 ? 'text-emerald-700' : 'text-neutral-900'
          }`}
        >
          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
        </span>
      ),
    },
    {
      header: 'Stock Level',
      align: 'right',
      render: (m) => (
        <span className="font-mono text-xs tabular-nums text-neutral-500">
          {m.previousStock} → <span className="font-semibold text-neutral-900">{m.newStock}</span>
        </span>
      ),
    },
    {
      header: 'Reference',
      render: (m) => (
        <span className="font-mono text-xs text-neutral-600">
          {m.referenceId || '—'}
        </span>
      ),
    },
    {
      header: 'Staff / Reason',
      render: (m) => (
        <div className="text-xs">
          <span className="text-neutral-800 block">{m.performedBy}</span>
          {m.reason && <span className="text-[11px] text-neutral-500 block truncate max-w-xs">{m.reason}</span>}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={movements}
      keyExtractor={(m) => m.id}
      isLoading={isLoading}
      emptyTitle="No stock movements recorded"
      emptyMessage="Inventory transactions will appear here as sales, receipts, and adjustments occur."
    />
  );
};
