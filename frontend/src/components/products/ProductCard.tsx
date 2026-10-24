import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/currency';
import { Eye, Glasses } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onQuickReserve?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickReserve,
  className = '',
}) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const displayImage = activeVariant?.images?.[0] || product.featuredImage;

  const totalStock = product.variants.reduce(
    (acc, v) => acc + (v.stockOnHand - v.reservedQuantity),
    0
  );

  return (
    <div
      className={`group flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-neutral-400 hover:shadow-xs ${className}`}
    >
      {/* Product Image Slot with zero-broken-image fallback */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block w-full aspect-4/3 bg-neutral-50 overflow-hidden"
      >
        {!imgError && displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-400">
            <Glasses className="w-12 h-12 stroke-[1.25] text-neutral-400 mb-1" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
              {product.modelCode}
            </span>
          </div>
        )}

        {/* Quiet status tag */}
        <div className="absolute top-2.5 left-2.5">
          {totalStock <= 0 ? (
            <span className="text-[11px] font-medium text-rose-700 bg-white/95 px-2 py-0.5 rounded shadow-2xs">
              Out of stock
            </span>
          ) : totalStock <= 5 ? (
            <span className="text-[11px] font-medium text-amber-700 bg-white/95 px-2 py-0.5 rounded shadow-2xs">
              Low stock ({totalStock} left)
            </span>
          ) : null}
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand & Category unboxed text metadata */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
          <span className="font-semibold text-neutral-700">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{product.category}</span>
        </div>

        {/* Title */}
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-semibold text-neutral-900 line-clamp-1 hover:underline mb-2"
        >
          {product.name}
        </Link>

        {/* Variants Color Swatches (Buttons with handlers) */}
        {product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3">
            {product.variants.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantIdx(idx)}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedVariantIdx === idx
                    ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110'
                    : 'border-neutral-300 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: v.colorHex }}
                title={`${v.colorName} (${v.size})`}
                aria-label={`Select ${v.colorName}`}
              />
            ))}
            <span className="text-[11px] text-neutral-500 ml-1 font-mono">
              {product.variants.length} colors
            </span>
          </div>
        )}

        {/* Price and CTA row */}
        <div className="mt-auto pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-mono uppercase">Price</span>
            <span className="text-sm font-bold font-mono tabular-nums text-neutral-900">
              {formatINR(activeVariant?.sellingPrice || product.basePrice)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to={`/products/${product.slug}`}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
              title="View product specifications"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {onQuickReserve && (
              <button
                onClick={() => onQuickReserve(product)}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded transition-colors whitespace-nowrap"
              >
                Reserve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
