import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductGrid } from '../../components/products/ProductGrid';
import { ProductFilters, FilterState } from '../../components/products/ProductFilters';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { ProductType } from '../../types/product.types';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeParam = searchParams.get('type') as ProductType | null;

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    productType: typeParam || 'all',
    category: 'all',
    brand: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    inStockOnly: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { products, total, totalPages, loading, refresh } = useProducts({
    page: currentPage,
    pageSize,
    search: filters.search || undefined,
    productType: filters.productType !== 'all' ? filters.productType : undefined,
    category: filters.category !== 'all' ? filters.category : undefined,
    brand: filters.brand !== 'all' ? filters.brand : undefined,
    inStockOnly: filters.inStockOnly,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };
      if (updated.productType) {
        if (updated.productType === 'all') {
          searchParams.delete('type');
        } else {
          searchParams.set('type', updated.productType);
        }
        setSearchParams(searchParams);
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      productType: 'all',
      category: 'all',
      brand: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      inStockOnly: false,
    });
    searchParams.delete('type');
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Title & Stats */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {filters.productType === 'all' ? 'All Optical Collections' : filters.productType}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Showing {total} precision frames and lenses crafted for optical accuracy.
        </p>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            value={filters.search}
            onChange={(val) => handleFilterChange({ search: val })}
            placeholder="Search by frame, model, or brand..."
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <label className="text-neutral-500 shrink-0 font-medium">Sort By:</label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
              handleFilterChange({ sortBy, sortOrder });
            }}
            className="text-xs rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 focus:border-neutral-900 focus:outline-none"
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="createdAt-desc">Newest First</option>
          </select>
        </div>
      </div>

      {/* Main Grid + Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          <ProductGrid
            products={products}
            onQuickReserve={(p) => navigate(`/book/reservation?product=${p.id}`)}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
