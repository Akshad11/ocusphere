import React, { useState } from 'react';
import { Product, ProductType } from '../../types/product.types';
import { Search, Barcode, Plus, Glasses } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export interface POSProductSearchProps {
  products: Product[];
  onAddToCart: (product: Product, variantId?: string) => void;
  className?: string;
}

export const POSProductSearch: React.FC<POSProductSearchProps> = ({
  products,
  onAddToCart,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: Array<{ label: string; value: string }> = [
    { label: 'All', value: 'all' },
    { label: 'Eyeglasses', value: 'Eyeglasses' },
    { label: 'Sunglasses', value: 'Sunglasses' },
    { label: 'Lenses', value: 'Prescription lenses' },
    { label: 'Contacts', value: 'Contact lenses' },
    { label: 'Accessories', value: 'Accessories' },
  ];

  // Filter products
  const filtered = products.filter((p) => {
    if (activeCategory !== 'all' && p.productType !== activeCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCode = p.modelCode.toLowerCase().includes(q);
      const matchSku = p.variants.some(
        (v) => v.variantSku.toLowerCase().includes(q) || v.barcode.includes(q)
      );
      return matchName || matchBrand || matchCode || matchSku;
    }
    return true;
  });

  return (
    <div className={`flex flex-col h-full bg-white border border-neutral-200 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Top search & barcode bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Scan barcode or search model, SKU, brand..."
          className="w-full pl-9 pr-10 py-2 text-sm rounded-md border border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          autoFocus
        />
        <div className="absolute right-3 flex items-center text-neutral-400">
          <Barcode className="w-5 h-5" />
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === c.value
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            No products found matching "{search}"
          </div>
        ) : (
          filtered.map((prod) => {
            const primaryVar = prod.variants[0];
            const available = prod.variants.reduce(
              (acc, v) => acc + (v.stockOnHand - v.reservedQuantity),
              0
            );

            return (
              <div
                key={prod.id}
                className="flex flex-col justify-between p-3 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors bg-white text-left group"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase truncate">
                      {prod.brand}
                    </span>
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        available <= 0
                          ? 'bg-red-50 text-red-700'
                          : available <= 3
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {available} in stock
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{prod.name}</h4>
                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">{prod.modelCode}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono tabular-nums text-neutral-900">
                    {formatINR(prod.basePrice)}
                  </span>
                  <button
                    onClick={() => onAddToCart(prod, primaryVar?.id)}
                    disabled={available <= 0}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
