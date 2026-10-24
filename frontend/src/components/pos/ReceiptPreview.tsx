import React from 'react';
import { Sale } from '../../types/sales.types';
import { formatINR } from '../../utils/currency';
import { formatDateTime } from '../../utils/dates';
import { Printer } from 'lucide-react';
import { Button } from '../common/Button';

export interface ReceiptPreviewProps {
  sale: Sale;
  onPrint?: () => void;
  onClose?: () => void;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ sale, onPrint, onClose }) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Printable Paper Box */}
      <div
        id="printable-receipt"
        className="w-full max-w-sm bg-white p-6 border border-neutral-300 rounded shadow-sm text-neutral-900 font-mono text-xs leading-relaxed"
      >
        {/* Header */}
        <div className="text-center pb-3 border-b border-dashed border-neutral-300 space-y-1">
          <h2 className="text-sm font-bold tracking-tight">OCUSPHERE OPTICAL ATELIER</h2>
          <p className="text-[11px] text-neutral-600">Bandra West Flagship, Mumbai</p>
          <p className="text-[11px] text-neutral-600">GSTIN: 27AABCO9918K1ZM</p>
          <p className="text-[11px] text-neutral-600">Tel: +91 (022) 2640 8899</p>
        </div>

        {/* Invoice Meta */}
        <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span className="font-bold">{sale.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDateTime(sale.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{sale.cashierName}</span>
          </div>
          {sale.customer && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="truncate max-w-[180px]">{sale.customer.name} ({sale.customer.phone})</span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="py-2.5 border-b border-dashed border-neutral-300">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="pb-1 font-semibold">Item</th>
                <th className="pb-1 text-center font-semibold">Qty</th>
                <th className="pb-1 text-right font-semibold">Price</th>
                <th className="pb-1 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1 pr-1">
                    <span className="font-semibold block">{item.productName}</span>
                    <span className="text-[10px] text-neutral-500">
                      {item.colorName} · {item.size}
                    </span>
                  </td>
                  <td className="py-1 text-center tabular-nums">{item.quantity}</td>
                  <td className="py-1 text-right tabular-nums">{formatINR(item.unitPrice)}</td>
                  <td className="py-1 text-right tabular-nums">{formatINR(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="py-2.5 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="tabular-nums">{formatINR(sale.subtotal)}</span>
          </div>
          {sale.discountTotal > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>Discount ({sale.appliedCoupon || 'Promotion'}):</span>
              <span className="tabular-nums">-{formatINR(sale.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-600">
            <span>GST ({sale.taxRatePercent}%):</span>
            <span className="tabular-nums">{formatINR(sale.taxTotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-300">
            <span>Grand Total:</span>
            <span className="tabular-nums">{formatINR(sale.grandTotal)}</span>
          </div>

          <div className="pt-2 border-t border-dashed border-neutral-300 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold">{sale.paymentMethod}</span>
            </div>
            {sale.amountReceived && (
              <div className="flex justify-between">
                <span>Amount Tendered:</span>
                <span className="tabular-nums">{formatINR(sale.amountReceived)}</span>
              </div>
            )}
            {sale.changeGiven !== undefined && sale.changeGiven > 0 && (
              <div className="flex justify-between font-bold">
                <span>Change Returned:</span>
                <span className="tabular-nums">{formatINR(sale.changeGiven)}</span>
              </div>
            )}
            {sale.transactionReference && (
              <div className="flex justify-between text-neutral-500 text-[10px]">
                <span>Ref:</span>
                <span>{sale.transactionReference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-dashed border-neutral-300 text-center text-[10px] text-neutral-500 space-y-1">
          <p>Thank you for choosing OcuSphere!</p>
          <p>30-Day Frame Warranty · Free Ultrasonic Cleaning Anytime</p>
          <p className="font-bold tracking-widest pt-1">*** COPY OF INVOICE ***</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-3">
        <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
          Print Receipt
        </Button>
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};
