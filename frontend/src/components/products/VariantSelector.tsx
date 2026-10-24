import React from 'react';
import { ProductVariant } from '../../types/product.types';
import { formatINR } from '../../utils/currency';

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
}) => {
  const selected = variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className="space-y-4">
      {/* Color options */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-neutral-800">Color Variant</span>
          <span className="text-neutral-500">{selected?.colorName}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {variants.map((v) => {
            const isSelected = v.id === selectedVariantId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariant(v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: v.colorHex }}
                />
                <span>{v.colorName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Size & Material info */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs">
        <div>
          <span className="text-[11px] text-neutral-500 block uppercase font-mono">Frame Size</span>
          <span className="font-medium text-neutral-900">{selected?.size}</span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 block uppercase font-mono">Material</span>
          <span className="font-medium text-neutral-900">{selected?.material}</span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 block uppercase font-mono">SKU</span>
          <span className="font-mono text-neutral-800">{selected?.variantSku}</span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 block uppercase font-mono">Availability</span>
          <span className="font-medium text-neutral-900 font-mono tabular-nums">
            {selected?.stockOnHand - selected?.reservedQuantity > 0
              ? `${selected.stockOnHand - selected.reservedQuantity} in stock`
              : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );
};
