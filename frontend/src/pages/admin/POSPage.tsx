import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { POSProductSearch } from '../../components/pos/POSProductSearch';
import { POSCart, CartItem } from '../../components/pos/POSCart';
import { POSPaymentDialog } from '../../components/pos/POSPaymentDialog';
import { ReceiptPreview } from '../../components/pos/ReceiptPreview';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { useSales } from '../../hooks/useSales';
import { Product, ProductVariant } from '../../types/product.types';
import { Customer } from '../../types/customer.types';
import { PaymentMethod, Sale } from '../../types/sales.types';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { UserCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export const POSPage: React.FC = () => {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { createSale } = useSales();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart actions
  const handleAddToCart = (product: Product, variantId?: string) => {
    const variant = variantId
      ? product.variants.find((v) => v.id === variantId) || product.variants[0]
      : product.variants[0];

    if (!variant) return;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.variant.id === variant.id);
      if (existing) {
        return prev.map((i) =>
          i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, variant, quantity: 1, discount: 0 }];
    });
  };

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.variant.id === variantId) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCartItems((prev) => prev.filter((i) => i.variant.id !== variantId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(undefined);
    setDiscountAmount(0);
  };

  // Totals
  const subtotal = cartItems.reduce((acc, i) => acc + i.variant.sellingPrice * i.quantity, 0);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = 12;
  const taxTotal = parseFloat(((taxableSubtotal * taxRate) / 100).toFixed(2));
  const grandTotal = parseFloat((taxableSubtotal + taxTotal).toFixed(2));

  // Payment Confirmation
  const handleConfirmPayment = async (
    method: PaymentMethod,
    amountReceived?: number,
    transactionReference?: string
  ) => {
    setIsProcessing(true);
    try {
      const sale = await createSale({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Walk-in Guest',
        customerPhone: selectedCustomer?.phone || '',
        customerEmail: selectedCustomer?.email,
        items: cartItems.map((i) => ({
          variantId: i.variant.id,
          quantity: i.quantity,
          unitPrice: i.variant.sellingPrice,
          discount: i.discount,
        })),
        appliedCoupon,
        discountTotal: discountAmount,
        paymentMethod: method,
        amountReceived,
        transactionReference,
        cashierName: 'Aman Patel',
      });

      setCompletedSale(sale);
      setIsPaymentOpen(false);
      handleClearCart();
    } catch (err: any) {
      alert(err?.message || 'Sale checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.lastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.customerCode.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="Dispensary Point of Sale (POS)"
        subtitle="Counter billing, barcode scanning, optical discounts, and cash/UPI settlement."
        actions={
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-neutral-500">Terminal: REG-01</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-neutral-800">Cashier: Aman Patel</span>
          </div>
        }
      />

      {/* POS Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-230px)] min-h-[580px]">
        {/* Left Column: Product Search & Barcode Input (7 cols) */}
        <div className="lg:col-span-7 h-full">
          <POSProductSearch products={products} onAddToCart={handleAddToCart} />
        </div>

        {/* Right Column: Cart, Customer Picker & Payment (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <POSCart
            items={cartItems}
            customer={selectedCustomer}
            onSelectCustomer={() => setIsCustomerModalOpen(true)}
            onClearCustomer={() => setSelectedCustomer(null)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => setIsPaymentOpen(true)}
            appliedCoupon={appliedCoupon}
            discountAmount={discountAmount}
            onApplyCoupon={(code, amt) => {
              setAppliedCoupon(code);
              setDiscountAmount(amt);
            }}
            onRemoveCoupon={() => {
              setAppliedCoupon(undefined);
              setDiscountAmount(0);
            }}
          />
        </div>
      </div>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Select Customer for Invoice"
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <SearchInput
            value={customerSearch}
            onChange={setCustomerSearch}
            placeholder="Search by patient name, phone, or code..."
          />

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
            {filteredCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No customer found matching "{customerSearch}"
              </div>
            ) : (
              filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setIsCustomerModalOpen(false);
                  }}
                  className="p-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between rounded transition-colors"
                >
                  <div>
                    <span className="font-bold text-xs text-neutral-900 block">
                      {cust.firstName} {cust.lastName}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {cust.phone} · {cust.customerCode}
                    </span>
                  </div>
                  {cust.prescriptions.length > 0 && (
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                      Has Prescription
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Payment Settlement Dialog */}
      <POSPaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        subtotal={subtotal}
        discountTotal={discountAmount}
        taxTotal={taxTotal}
        grandTotal={grandTotal}
        customerName={selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Walk-in Guest'}
        onConfirmPayment={handleConfirmPayment}
        isLoading={isProcessing}
      />

      {/* Sale Completion & Printable Receipt Modal */}
      {completedSale && (
        <Modal
          isOpen={true}
          onClose={() => setCompletedSale(null)}
          title="Sale Completed Successfully"
          maxWidth="md"
        >
          <ReceiptPreview sale={completedSale} onClose={() => setCompletedSale(null)} />
        </Modal>
      )}
    </div>
  );
};
