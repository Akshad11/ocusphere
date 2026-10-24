import React from 'react';
import { Product } from '../../types/product.types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

export interface ProductGridProps {
  products: Product[];
  onQuickReserve?: (product: Product) => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onQuickReserve,
  emptyTitle = 'No eyewear matches your search',
  emptyMessage = 'Try clearing filters or adjusting your search keyword.',
}) => {
  if (!products || products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickReserve={onQuickReserve}
        />
      ))}
    </div>
  );
};
