import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import { ProductGallery } from '../../components/products/ProductGallery';
import { VariantSelector } from '../../components/products/VariantSelector';
import { formatINR } from '../../utils/currency';
import { ProductVariant } from '../../types/product.types';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Calendar, ArrowLeft, Check, Sparkles, Store } from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const identifier = id || slug || '';
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(identifier);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (loading) return <LoadingState message="Loading frame specifications..." />;
  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorState
          title="Product not found"
          message={error || 'This frame model could not be found in our current catalogue.'}
          onRetry={() => navigate('/products')}
        />
      </div>
    );
  }

  const variantsList = Array.isArray(product.variants) ? product.variants : [];
  const activeVariant = selectedVariant || variantsList[0];
  const availableStock = activeVariant ? (activeVariant.stockOnHand || 0) - (activeVariant.reservedQuantity || 0) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </Link>
        <span className="text-xs text-neutral-400 font-mono">Model: {product.modelCode}</span>
      </div>

      {/* Main PDP 2-Column Contiguous Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Sticky Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={activeVariant?.images?.length ? activeVariant.images : (product.images || [])}
            productName={product.name}
            modelCode={product.modelCode}
          />
        </div>

        {/* Right: Purchase & Reservation Module */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1">
              <span className="font-semibold text-neutral-800">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.productType}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {formatINR(activeVariant?.sellingPrice || product.basePrice)}
              </span>
              <span className="text-xs text-neutral-500">Includes frame & demo lenses</span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
            {product.description}
          </p>

          {/* Variant Selector */}
          <div className="border-t border-neutral-200 pt-4">
            <VariantSelector
              variants={variantsList}
              selectedVariantId={activeVariant?.id || ''}
              onSelectVariant={setSelectedVariant}
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button
              size="lg"
              className="w-full"
              disabled={availableStock <= 0}
              onClick={() =>
                navigate(
                  `/book/reservation?product=${product.id}&variant=${activeVariant?.id}`
                )
              }
              icon={<Store className="w-4 h-4" />}
            >
              {availableStock > 0 ? 'Reserve Frame for In-Store Pickup (Free 3-Day Hold)' : 'Out of Stock'}
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => navigate('/book/appointment')}
              icon={<Calendar className="w-4 h-4" />}
            >
              Book Accompanying Clinical Eye Test
            </Button>
          </div>

          {/* Optical Guarantee & In-Store Perks */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2 font-semibold text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>OcuSphere In-Store Promise</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-[11px] text-neutral-600">
              <li>Free laser-guided pupillary distance (PD) measurement</li>
              <li>14-day progressive lens adaptation guarantee</li>
              <li>Complimentary ultrasonic deep cleaning & nosepad replacement</li>
              <li>1-Year structural hinge & solder warranty</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
