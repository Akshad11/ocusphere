import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Printer, FileCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { mockPurchaseOrderService } from '../../services/mockPurchaseOrderService';
import { PurchaseOrder } from '../../types/purchasing.types';
import { formatDate } from '../../utils/dates';

export const PurchaseOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      mockPurchaseOrderService.getById(id)
        .then((data) => {
          setPo(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const handleReceiveGoods = async () => {
    if (!po) return;
    if (confirm('Create Goods Receipt Note (GRN) and receive all remaining quantities into active inventory?')) {
      await mockPurchaseOrderService.confirmGoodsReceipt({
        purchaseOrderId: po.id,
        deliveryNoteNumber: `DN-${Date.now().toString().slice(-5)}`,
        receivedBy: 'Warehouse Inspector (Staff)',
        items: po.items.map((i) => ({
          purchaseOrderItemId: i.id,
          variantId: i.variantId,
          receivedNow: Math.max(0, i.orderedQuantity - i.receivedQuantity),
          damagedOrMissing: 0,
        })),
      });
      const refreshed = await mockPurchaseOrderService.getById(po.id);
      setPo(refreshed);
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 text-center">Loading PO details...</div>;
  }

  if (!po) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Purchase Order not found.</p>
        <Link to="/admin/purchasing/orders" className="text-neutral-900 underline">
          Back to Purchase Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/purchasing/orders" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{po.orderNumber}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-800">
                {po.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Supplier: <strong className="text-neutral-800">{po.supplierName}</strong> &bull; Issued:{' '}
              {formatDate(po.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {po.status !== 'Received' && (
            <Button size="sm" onClick={handleReceiveGoods} className="!bg-emerald-700 hover:!bg-emerald-800">
              <FileCheck className="w-4 h-4 mr-1.5" /> Inward Goods (GRN)
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" /> Print PO
          </Button>
        </div>
      </div>

      {/* PO Overview */}
      <div className="bg-white border border-neutral-200 p-6 space-y-6">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-neutral-100 text-sm">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Vendor Information</h3>
            <p className="font-bold text-neutral-900">{po.supplierName}</p>
            <p className="text-xs text-neutral-500 mt-2 font-mono">Supplier ID: {po.supplierId}</p>
            <p className="text-xs text-neutral-500">Ordered by: {po.createdByName}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Delivery Target</h3>
            <p className="font-bold font-mono text-neutral-900">{formatDate(po.expectedDeliveryDate)}</p>
            <p className="text-xs text-neutral-500 mt-2">Destination:</p>
            <p className="text-xs text-neutral-700">OcuSphere Flagship Store, Indiranagar, Bengaluru</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Billing Details</h3>
            <p className="text-xs text-neutral-700 leading-relaxed">
              OcuSphere Retail Solutions Pvt Ltd, HAL 2nd Stage, Indiranagar, Bengaluru - 560038
            </p>
            <p className="text-xs text-neutral-500 mt-2 font-mono">GSTIN: 29AABCO1234F1Z5</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">Procurement Items</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">Ordered</th>
                <th className="py-2.5 px-3 text-center">Received</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {po.items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-3 font-medium text-neutral-900">{item.productName}</td>
                  <td className="py-3 px-3 font-mono text-xs text-neutral-500">{item.variantSku}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-neutral-900">{item.orderedQuantity}</td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">
                    {item.receivedQuantity || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <CurrencyDisplay amount={item.unitCost} />
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                    <CurrencyDisplay amount={item.totalCost} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation summary */}
        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-mono"><CurrencyDisplay amount={po.subtotal} /></span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>GST Tax:</span>
              <span className="font-mono"><CurrencyDisplay amount={po.taxAmount} /></span>
            </div>
            <div className="flex justify-between text-neutral-900 font-bold text-base border-t border-neutral-200 pt-2">
              <span>Total PO Value:</span>
              <span className="font-mono"><CurrencyDisplay amount={po.totalCost} /></span>
            </div>
          </div>
        </div>

        {po.notes && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
            <strong>Notes / Instructions:</strong> {po.notes}
          </div>
        )}
      </div>
    </div>
  );
};
