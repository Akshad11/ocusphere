import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useSale, useSales } from '../../hooks/useSales';
import { formatINR } from '../../utils/currency';
import { formatDateTime } from '../../utils/dates';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptPreview } from '../../components/pos/ReceiptPreview';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Printer, RotateCcw, ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '../../types/sales.types';

export const SaleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sale, loading, error, refresh } = useSale(id || '');
  const { processReturn } = useSales();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState<'Fitting Issue' | 'Prescription Mismatch' | 'Defect' | 'Customer Changed Mind' | 'Other'>('Fitting Issue');
  const [restockStock, setRestockStock] = useState(true);
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('UPI');
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  if (loading) return <LoadingState message="Loading sale invoice..." />;
  if (error || !sale) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Invoice not found"
          message={error || 'Invoice record could not be found.'}
          onRetry={() => navigate('/admin/sales')}
        />
      </div>
    );
  }

  const handleProcessRefund = async () => {
    setIsProcessingReturn(true);
    try {
      await processReturn(
        sale.id,
        refundMethod,
        sale.items.map((i) => ({
          saleItemId: i.id,
          variantId: i.variantId,
          returnedQuantity: i.quantity,
          reason: returnReason,
          restockStock,
        })),
        'Kavita Joshi (Store Manager)'
      );
      setIsReturnModalOpen(false);
      await refresh();
      alert('Return processed successfully! Inventory restored and customer refund recorded.');
    } catch (err: any) {
      alert(err?.message || 'Failed to process return');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Invoice ${sale.invoiceNumber}`}
        subtitle={`Recorded on ${formatDateTime(sale.createdAt)} by ${sale.cashierName}`}
        badge={<StatusBadge status={sale.status} />}
        breadcrumbs={[
          { label: 'Sales History', path: '/admin/sales' },
          { label: sale.invoiceNumber },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => setIsReceiptModalOpen(true)}
            >
              Print Receipt
            </Button>
            {sale.status === 'Completed' && (
              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => setIsReturnModalOpen(true)}
              >
                Process Return / Refund
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Line Items Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Purchased Eyewear & Optical Items
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 pb-2">
                  <th className="pb-2 font-medium">Item Description</th>
                  <th className="pb-2 font-medium">Variant SKU</th>
                  <th className="pb-2 text-right font-medium">Unit Price</th>
                  <th className="pb-2 text-center font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <span className="font-bold text-neutral-900 block">{item.productName}</span>
                      <span className="text-[11px] text-neutral-500">
                        {item.brand} · {item.colorName} · {item.size}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-neutral-600">{item.variantSku}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{formatINR(item.unitPrice)}</td>
                    <td className="py-3 text-center font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3 text-right font-mono font-bold tabular-nums text-neutral-900">
                      {formatINR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="pt-4 border-t border-neutral-200 flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatINR(sale.subtotal)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({sale.appliedCoupon || 'Promotion'}):</span>
                  <span className="font-mono tabular-nums">-{formatINR(sale.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>GST ({sale.taxRatePercent}%):</span>
                <span className="font-mono tabular-nums">{formatINR(sale.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 text-sm pt-2 border-t border-neutral-200">
                <span>Grand Total:</span>
                <span className="font-mono tabular-nums text-base">{formatINR(sale.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment Details (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-neutral-700">Customer Details</h4>
            {sale.customer ? (
              <div className="space-y-1.5 text-neutral-700">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-sm">
                  <User className="w-4 h-4 text-neutral-700" />
                  <span>{sale.customer.name}</span>
                </div>
                <div className="font-mono text-neutral-600">{sale.customer.phone}</div>
                {sale.customer.email && <div className="text-neutral-500">{sale.customer.email}</div>}
                {sale.customer.id && (
                  <Link
                    to={`/admin/customers/${sale.customer.id}`}
                    className="inline-block mt-2 font-semibold text-neutral-900 hover:underline"
                  >
                    View Patient Master File →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-neutral-500">Walk-in Guest Checkout</p>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-neutral-700">Payment Breakdown</h4>
            <div className="space-y-2 text-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">Mode:</span>
                <span className="font-semibold">{sale.paymentMethod}</span>
              </div>
              {sale.transactionReference && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Reference:</span>
                  <span className="font-mono text-[11px] truncate max-w-[140px]">
                    {sale.transactionReference}
                  </span>
                </div>
              )}
              {sale.amountReceived && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cash Received:</span>
                  <span className="font-mono tabular-nums">{formatINR(sale.amountReceived)}</span>
                </div>
              )}
              {sale.changeGiven !== undefined && sale.changeGiven > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Change Returned:</span>
                  <span className="font-mono tabular-nums font-bold">{formatINR(sale.changeGiven)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {isReceiptModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsReceiptModalOpen(false)}
          title={`Printable Receipt — ${sale.invoiceNumber}`}
          maxWidth="md"
        >
          <ReceiptPreview sale={sale} onClose={() => setIsReceiptModalOpen(false)} />
        </Modal>
      )}

      {/* Process Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title={`Process Refund for ${sale.invoiceNumber}`}
        subtitle="This will update sales status, issue credit, and optionally restock the inventory."
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleProcessRefund}
              isLoading={isProcessingReturn}
            >
              Confirm Return & Refund {formatINR(sale.grandTotal)}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Return Reason</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value as any)}
              className="w-full border border-neutral-300 rounded p-2 text-xs bg-white"
            >
              <option value="Fitting Issue">Fitting / Bridge Discomfort</option>
              <option value="Prescription Mismatch">Power / Prescription Discrepancy</option>
              <option value="Defect">Manufacturing Hinge / Lens Defect</option>
              <option value="Customer Changed Mind">Customer Changed Mind</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Refund Method</label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value as any)}
              className="w-full border border-neutral-300 rounded p-2 text-xs bg-white"
            >
              <option value="UPI">Original UPI / Bank Reversal</option>
              <option value="Card">Card Gateway Chargeback</option>
              <option value="Cash">Cash Voucher / Cash</option>
              <option value="Other">Store Credit</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={restockStock}
                onChange={(e) => setRestockStock(e.target.checked)}
                className="rounded border-neutral-300"
              />
              <span>Restock returned frame back into available showroom inventory</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};
