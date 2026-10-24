import React from 'react';
import { ProductType } from '../../types/product.types';

export interface FilterState {
  search: string;
  productType: ProductType | 'all';
  category: string;
  brand: string;
  sortBy: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder: 'asc' | 'desc';
  inStockOnly: boolean;
}

export interface ProductFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  brands?: string[];
  categories?: string[];
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  brands = ['Ray-Ban', 'Carl Zeiss', 'OcuSphere Signature', 'OcuSphere Atelier', 'Persol', 'Lindberg Spirit', 'Oakley', 'Essilor'],
  categories = ['Men', 'Women', 'Unisex', 'Kids', 'Designer', 'Accessories'],
  className = '',
}) => {
  const productTypes: Array<{ label: string; value: ProductType | 'all' }> = [
    { label: 'All Products', value: 'all' },
    { label: 'Eyeglasses', value: 'Eyeglasses' },
    { label: 'Sunglasses', value: 'Sunglasses' },
    { label: 'Prescription Lenses', value: 'Prescription lenses' },
    { label: 'Contact Lenses', value: 'Contact lenses' },
    { label: 'Accessories', value: 'Accessories' },
  ];

  return (
    <div className={`bg-white border border-neutral-200 rounded-lg p-4 space-y-5 ${className}`}>
      {/* Header and Reset */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Filters</span>
        <button
          onClick={onReset}
          className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Product Type (Segmented Buttons) */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Product Type</label>
        <div className="flex flex-wrap gap-1.5">
          {productTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ productType: t.value })}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                filters.productType === t.value
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full text-xs rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 focus:border-neutral-900 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Select */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => onChange({ brand: e.target.value })}
          className="w-full text-xs rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 focus:border-neutral-900 focus:outline-none"
        >
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* In stock toggle */}
      <div className="pt-2 border-t border-neutral-100">
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked })}
            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <span>In-Stock Only</span>
        </label>
      </div>
    </div>
  );
};
