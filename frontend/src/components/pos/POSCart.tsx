import React, { useState } from 'react';
import { Customer } from '../../types/customer.types';
import { Product, ProductVariant } from '../../types/product.types';
import { formatINR } from '../../utils/currency';
import { Trash2, Plus, Minus, User, TicketPercent, Check, X } from 'lucide-react';
import { mockOfferService } from '../../services/mockOfferService';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  discount: number;
}

export interface POSCartProps {
  items: CartItem[];
  customer: Customer | null;
  onSelectCustomer: () => void;
  onClearCustomer: () => void;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  onCheckout: (appliedCoupon?: string, discountTotal?: number) => void;
  appliedCoupon?: string;
  discountAmount?: number;
  onApplyCoupon: (code: string, amount: number) => void;
  onRemoveCoupon: () => void;
  className?: string;
}

export const POSCart: React.FC<POSCartProps> = ({
  items,
  customer,
  onSelectCustomer,
  onClearCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  appliedCoupon,
  discountAmount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  className = '',
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

  const subtotal = items.reduce((acc, i) => acc + i.variant.sellingPrice * i.quantity, 0);
  const categoriesInCart = Array.from(new Set(items.map((i) => i.product.productType)));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = 12; // 12% GST
  const taxTotal = parseFloat(((taxableAmount * taxRate) / 100).toFixed(2));
  const grandTotal = parseFloat((taxableAmount + taxTotal).toFixed(2));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsVerifyingCoupon(true);
    setCouponError('');

    try {
      const res = await mockOfferService.validateCoupon(couponInput, subtotal, categoriesInCart);
      if (res.isValid) {
        onApplyCoupon(couponInput.toUpperCase().trim(), res.discountAmount);
        setCouponInput('');
      } else {
        setCouponError(res.message);
      }
    } catch {
      setCouponError('Error validating coupon');
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-neutral-200 rounded-lg p-4 ${className}`}>
      {/* Top Header: Customer selection & Cart Clear */}
      <div className="pb-3 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-neutral-500" />
          {customer ? (
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 block truncate max-w-[140px]">
                {customer.firstName} {customer.lastName}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">{customer.phone}</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-600 font-medium">Walk-in Guest</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {customer ? (
            <button
              onClick={onClearCustomer}
              className="text-[11px] text-neutral-500 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={onSelectCustomer}
              className="px-2 py-1 text-[11px] font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
            >
              Select Customer
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
              title="Clear entire cart"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 divide-y divide-neutral-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <span className="text-xs">Cart is empty</span>
            <span className="text-[11px] text-neutral-400 mt-1">Scan barcode or click items to add</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.variant.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-2">
              <div className="flex-1">
                <h5 className="text-xs font-semibold text-neutral-900 leading-tight">
                  {item.product.name}
                </h5>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: item.variant.colorHex }}
                  />
                  <span>{item.variant.colorName}</span>
                  <span>·</span>
                  <span>{item.variant.size}</span>
                </div>
                <div className="text-xs font-mono tabular-nums font-semibold text-neutral-900 mt-1">
                  {formatINR(item.variant.sellingPrice)}
                </div>
              </div>

              {/* Quantity Stepper & Delete */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center border border-neutral-200 rounded">
                  <button
                    onClick={() => onUpdateQuantity(item.variant.id, -1)}
                    className="p-1 text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-mono tabular-nums font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.variant.id, 1)}
                    className="p-1 text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => onRemoveItem(item.variant.id)}
                  className="text-[10px] text-neutral-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Coupon Section */}
      {items.length > 0 && (
        <div className="pt-3 border-t border-neutral-200 space-y-2">
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <div className="flex items-center gap-1.5">
                <TicketPercent className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{appliedCoupon}</span>
                <span className="font-mono tabular-nums">(-{formatINR(discountAmount)})</span>
              </div>
              <button
                onClick={onRemoveCoupon}
                className="text-emerald-700 hover:text-emerald-900 p-0.5"
                title="Remove Coupon"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Coupon (e.g. SUMMERLOOK15)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:border-neutral-900 focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={isVerifyingCoupon || !couponInput.trim()}
                className="px-2.5 py-1.5 text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-50 rounded transition-colors"
              >
                Apply
              </button>
            </form>
          )}
          {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
        </div>
      )}

      {/* Totals Summary */}
      <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-xs">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums">{formatINR(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Promotion Discount</span>
            <span className="font-mono tabular-nums">-{formatINR(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600">
          <span>Configured GST ({taxRate}%)</span>
          <span className="font-mono tabular-nums">{formatINR(taxTotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
          <span>Final Total</span>
          <span className="font-mono tabular-nums text-base">{formatINR(grandTotal)}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <button
        onClick={() => onCheckout(appliedCoupon, discountAmount)}
        disabled={items.length === 0}
        className="w-full mt-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
      >
        Collect Payment · {formatINR(grandTotal)}
      </button>
    </div>
  );
};
