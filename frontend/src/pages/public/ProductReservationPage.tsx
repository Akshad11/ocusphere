import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useBookings } from '../../hooks/useBookings';
import { getTodayDateString } from '../../utils/dates';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { formatINR } from '../../utils/currency';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import { Store, ShieldCheck, Check } from 'lucide-react';

export const ProductReservationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { createReservation } = useBookings();

  const preselectedProdId = searchParams.get('product') || '';
  const preselectedVarId = searchParams.get('variant') || '';

  const [selectedProductId, setSelectedProductId] = useState(preselectedProdId);
  const [selectedVariantId, setSelectedVariantId] = useState(preselectedVarId);
  const [quantity, setQuantity] = useState(1);
  const [pickupDate, setPickupDate] = useState(getTodayDateString());
  const [pickupSlot, setPickupSlot] = useState('Afternoon (02:00 PM - 05:00 PM)');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct && selectedProduct.variants.length > 0) {
      if (!selectedVariantId || !selectedProduct.variants.some((v) => v.id === selectedVariantId)) {
        setSelectedVariantId(selectedProduct.variants[0].id);
      }
    }
  }, [selectedProduct, selectedVariantId]);

  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId);

  const productOptions = products.map((p) => ({
    label: `${p.brand} - ${p.name} (${p.modelCode})`,
    value: p.id,
  }));

  const variantOptions = (selectedProduct?.variants || []).map((v) => ({
    label: `${v.colorName} · ${v.size} (${formatINR(v.sellingPrice)})`,
    value: v.id,
  }));

  const slotOptions = [
    { label: 'Morning (10:00 AM - 01:00 PM)', value: 'Morning (10:00 AM - 01:00 PM)' },
    { label: 'Afternoon (02:00 PM - 05:00 PM)', value: 'Afternoon (02:00 PM - 05:00 PM)' },
    { label: 'Evening (05:00 PM - 08:30 PM)', value: 'Evening (05:00 PM - 08:30 PM)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedProductId || !selectedVariantId) {
      newErrors.product = 'Please select a frame and variant';
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Enter your full name';
    }
    if (!isValidPhone(customerPhone)) {
      newErrors.customerPhone = 'Enter a valid 10-digit mobile number';
    }
    if (customerEmail && !isValidEmail(customerEmail)) {
      newErrors.customerEmail = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await createReservation({
        customerName,
        customerPhone,
        customerEmail: customerEmail.trim() || undefined,
        productId: selectedProductId,
        variantId: selectedVariantId,
        quantity,
        pickupDate,
        pickupSlot,
        notes: notes.trim() || undefined,
      });
      navigate(`/booking/confirmation/${res.referenceNumber}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to place reservation hold');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          In-Store Trial & Pickup
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">
          Reserve Eyewear for Showroom Trial
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          We will package and hold this frame in our Bandra Flagship for 3 full business days. No prepayment or credit card required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Reservation Form */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Select Eyewear Model
              </label>
              <Select
                options={productOptions}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              />
            </div>

            {variantOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Choose Color & Sizing Variant
                </label>
                <Select
                  options={variantOptions}
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker
                label="Target Pickup Date"
                value={pickupDate}
                min={getTodayDateString()}
                onChange={(e) => setPickupDate(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Preferred Pickup Window
                </label>
                <Select
                  options={slotOptions}
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                />
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Vikram Singhania"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              error={errors.customerName}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone"
                placeholder="10-digit number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                error={errors.customerPhone}
                helperText="We will SMS you when your frame is packaged in the pickup bay"
              />
              <Input
                label="Email (Optional)"
                placeholder="name@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                error={errors.customerEmail}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Special Requests or Existing Prescription (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please have Essilor progressive lens samples ready for review"
                className="w-full rounded-md border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                icon={<Store className="w-4 h-4" />}
              >
                Confirm 3-Day In-Store Hold
              </Button>
            </div>
          </form>
        </div>

        {/* Selected Frame Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          {selectedProduct && selectedVariant && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4 text-xs">
              <div className="aspect-4/3 rounded-lg bg-white border border-neutral-200 overflow-hidden">
                <img
                  src={selectedVariant.images?.[0] || selectedProduct.featuredImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  {selectedProduct.brand}
                </span>
                <h4 className="font-bold text-sm text-neutral-900">{selectedProduct.name}</h4>
                <div className="flex items-center gap-1.5 text-neutral-600 mt-1">
                  <span>{selectedVariant.colorName}</span>
                  <span>·</span>
                  <span>{selectedVariant.size}</span>
                </div>
                <div className="text-base font-bold font-mono text-neutral-900 mt-2">
                  {formatINR(selectedVariant.sellingPrice)}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-[11px] text-neutral-600">
                <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Held exclusively for you for 72 hours</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Zero upfront commitment</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
