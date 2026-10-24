import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { mockInventoryService } from '../../services/mockInventoryService';
import { StockMovement } from '../../types/inventory.types';
import { exportToCsv } from '../../utils/exportCsv';
import { formatDateTime } from '../../utils/dates';

export const StockMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    mockInventoryService.getMovements().then((data) => {
      setMovements(data);
      setLoading(false);
    });
  }, []);

  const filtered = movements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.variantSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || m.movementType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    exportToCsv(
      'ocu-sphere-stock-movements',
      filtered.map((m) => ({
        ID: m.id,
        Date: m.timestamp,
        Product: m.productName,
        SKU: m.variantSku,
        Type: m.movementType,
        Delta: m.quantityDelta,
        PreviousStock: m.previousStock,
        NewStock: m.newStock,
        ReferenceType: m.referenceType,
        ReferenceId: m.referenceId,
        Reason: m.reason || '',
        Operator: m.performedBy,
      }))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/inventory" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Stock Movement Audit Log</h1>
            <p className="text-sm text-neutral-500">Every inbound receipt, sale deduction, return, and recount</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1.5" /> Export Log
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search product, SKU, reference ID, staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Movement Types' },
            { value: 'sale', label: 'Sale Deduction (POS)' },
            { value: 'purchase_receipt', label: 'Purchase Inbound (PO)' },
            { value: 'return', label: 'Customer Return' },
            { value: 'adjustment_in', label: 'Adjustment (In)' },
            { value: 'adjustment_out', label: 'Adjustment (Out)' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Product & SKU</th>
              <th className="py-3 px-4 text-center">Type</th>
              <th className="py-3 px-4 text-center">Delta Qty</th>
              <th className="py-3 px-4 text-center">Prev &rarr; New</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Reason / Notes</th>
              <th className="py-3 px-4">Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-sans">
            {filtered.map((m) => {
              const isPositive = m.quantityDelta > 0;
              return (
                <tr key={m.id} className="hover:bg-neutral-50/70">
                  <td className="py-3 px-4 text-xs font-mono text-neutral-500 whitespace-nowrap">
                    {formatDateTime(m.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-neutral-900">{m.productName}</div>
                    <div className="text-xs font-mono text-neutral-500">{m.variantSku}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded border border-neutral-200 bg-neutral-100 text-neutral-800">
                      {m.movementType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        isPositive ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5 inline" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 inline" />
                      )}
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-neutral-600">
                    {m.previousStock} &rarr; <span className="font-bold text-neutral-900">{m.newStock}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-800">{m.referenceId}</td>
                  <td className="py-3 px-4 text-xs text-neutral-600 max-w-xs truncate">{m.reason || '—'}</td>
                  <td className="py-3 px-4 text-xs text-neutral-700">{m.performedBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">No stock movements found.</div>
        )}
      </div>
    </div>
  );
};
