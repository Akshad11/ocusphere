import React, { useState } from 'react';
import { PaymentMethod } from '../../types/sales.types';
import { formatINR } from '../../utils/currency';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Banknote, QrCode, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';

export interface POSPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  customerName?: string;
  onConfirmPayment: (paymentMethod: PaymentMethod, amountReceived?: number, ref?: string) => Promise<void>;
  isLoading?: boolean;
}

export const POSPaymentDialog: React.FC<POSPaymentDialogProps> = ({
  isOpen,
  onClose,
  subtotal,
  discountTotal,
  taxTotal,
  grandTotal,
  customerName = 'Walk-in Guest',
  onConfirmPayment,
  isLoading = false,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [cashTendered, setCashTendered] = useState<string>(String(Math.ceil(grandTotal)));
  const [txnRef, setTxnRef] = useState<string>('');

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, parseFloat((tenderedNum - grandTotal).toFixed(2)));

  const handleComplete = async () => {
    if (method === 'Cash' && tenderedNum < grandTotal) {
      alert(`Tendered amount (₹${tenderedNum}) is less than total (₹${grandTotal})`);
      return;
    }
    await onConfirmPayment(
      method,
      method === 'Cash' ? tenderedNum : undefined,
      method === 'UPI' || method === 'Card' ? txnRef || `TXN-${Date.now().toString().slice(-8)}` : undefined
    );
  };

  const paymentOptions: Array<{ method: PaymentMethod; label: string; icon: any }> = [
    { method: 'UPI', label: 'UPI / QR', icon: QrCode },
    { method: 'Card', label: 'Card Swipe', icon: CreditCard },
    { method: 'Cash', label: 'Cash Tender', icon: Banknote },
    { method: 'Other', label: 'Split / Other', icon: Wallet },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete POS Sale"
      subtitle={`Billing for ${customerName}`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleComplete}
            isLoading={isLoading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Authorize & Complete Sale
          </Button>
        </>
      }
    >
      <div className="space-y-5 text-left">
        {/* Bill summary strip */}
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-[11px] text-neutral-500 block">Subtotal</span>
            <span className="font-mono tabular-nums font-semibold">{formatINR(subtotal)}</span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Discount</span>
            <span className="font-mono tabular-nums font-semibold text-emerald-700">
              -{formatINR(discountTotal)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">GST (12%)</span>
            <span className="font-mono tabular-nums font-semibold">{formatINR(taxTotal)}</span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Payable Amount</span>
            <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {paymentOptions.map((opt) => (
              <button
                key={opt.method}
                type="button"
                onClick={() => setMethod(opt.method)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  method === opt.method
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                }`}
              >
                <opt.icon className="w-5 h-5 mb-2" />
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific fields */}
        {method === 'Cash' && (
          <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cash Tendered by Customer (₹)
              </label>
              <input
                type="number"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full text-base font-mono font-bold px-3 py-2 border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded text-xs">
              <span className="text-neutral-600 font-medium">Change to Return:</span>
              <span className="text-sm font-mono font-bold tabular-nums text-neutral-900">
                {formatINR(changeDue)}
              </span>
            </div>
          </div>
        )}

        {method === 'UPI' && (
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 text-center space-y-2">
            <div className="w-32 h-32 mx-auto bg-white border border-neutral-300 rounded flex flex-col items-center justify-center p-2 shadow-2xs">
              <QrCode className="w-24 h-24 text-neutral-800" />
              <span className="text-[9px] font-mono text-neutral-500">BHIM / UPI DYNAMIC</span>
            </div>
            <p className="text-xs font-semibold text-neutral-900">
              Scan with GPay, PhonePe, Paytm, or any UPI app
            </p>
            <p className="text-[11px] text-neutral-500">
              VPA: <span className="font-mono">billing@okaxis (OcuSphere Bandra)</span>
            </p>
            <div className="pt-2 max-w-xs mx-auto">
              <input
                type="text"
                placeholder="UPI Reference No. (Optional)"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white font-mono"
              />
            </div>
          </div>
        )}

        {method === 'Card' && (
          <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-2 text-xs">
            <p className="font-medium text-neutral-800">
              Swipe, dip, or tap customer credit/debit card on POS terminal.
            </p>
            <input
              type="text"
              placeholder="Card Auth / Approval Code (Optional)"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded font-mono"
            />
          </div>
        )}

        {method === 'Other' && (
          <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-2 text-xs">
            <p className="text-neutral-600">
              Record gift voucher, store credit, or insurance co-pay settlement.
            </p>
            <input
              type="text"
              placeholder="Voucher or Authorization Reference"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded font-mono"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
