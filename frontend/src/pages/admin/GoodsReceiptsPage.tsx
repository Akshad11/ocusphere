import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { mockPurchaseOrderService } from '../../services/mockPurchaseOrderService';
import { GoodsReceipt } from '../../types/purchasing.types';
import { formatDate } from '../../utils/dates';
import { exportToCsv } from '../../utils/exportCsv';

export const GoodsReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    mockPurchaseOrderService.listGoodsReceipts().then((data) => {
      setReceipts(data);
      setLoading(false);
    });
  }, []);

  const filtered = receipts.filter(
    (grn) =>
      grn.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    exportToCsv(
      'ocu-sphere-goods-receipts',
      filtered.map((r) => ({
        GRN: r.receiptNumber,
        PO: r.orderNumber,
        Supplier: r.supplierName,
        ReceiptDate: r.receivedDate,
        ReceivedBy: r.receivedBy,
        DeliveryNote: r.deliveryNoteNumber || '',
      }))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/purchasing/orders" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Goods Receipt Notes (GRN)</h1>
            <p className="text-sm text-neutral-500">
              Verified warehouse shipments, optical QC inspection reports, and inventory addition receipts
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1.5" /> Export GRN Log
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-neutral-200 p-4">
        <Input
          placeholder="Search GRN #, PO Number, Supplier, or Challan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">GRN Number</th>
              <th className="py-3 px-4">PO Reference</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Receipt Date</th>
              <th className="py-3 px-4">Inspector / Receiver</th>
              <th className="py-3 px-4 text-center">Items Received</th>
              <th className="py-3 px-4 text-center">QC Status</th>
              <th className="py-3 px-4 text-right">Delivery Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((grn) => {
              const totalItems = grn.items.reduce((acc, i) => acc + i.receivedNow, 0);
              const damagedCount = grn.items.reduce((acc, i) => acc + (i.damagedOrMissing || 0), 0);
              const allPassed = damagedCount === 0;

              return (
                <tr key={grn.id} className="hover:bg-neutral-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-neutral-900">
                    {grn.receiptNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-600">
                    <Link to={`/admin/purchasing/orders/${grn.purchaseOrderId}`} className="hover:underline">
                      {grn.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-900">{grn.supplierName}</td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-500 whitespace-nowrap">
                    {formatDate(grn.receivedDate)}
                  </td>
                  <td className="py-3 px-4 text-xs text-neutral-700">{grn.receivedBy}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">
                    {totalItems} units
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        allPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {allPassed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> QC Passed
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> {damagedCount} Damaged
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-neutral-600">
                    {grn.deliveryNoteNumber || 'CHL-9982'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No goods receipts matching search.
          </div>
        )}
      </div>
    </div>
  );
};
