import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Barcode, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { mockProductService } from '../../services/mockProductService';
import { Product } from '../../types/product.types';

export const ProductDetailsAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      mockProductService.getById(id)
        .then((p) => {
          setProduct(p);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    if (confirm(`Are you sure you want to delete/archive "${product.name}"?`)) {
      await mockProductService.delete(product.id);
      navigate('/admin/products');
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 text-center">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Product not found</p>
        <Link to="/admin/products" className="text-neutral-900 underline font-medium">
          Back to Products List
        </Link>
      </div>
    );
  }

  const totalStock = product.variants.reduce((acc, v) => acc + v.stockOnHand, 0);
  const defaultVariant = product.variants[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{product.name}</h1>
              <StatusBadge status={product.status === 'published' ? 'active' : 'inactive'} />
            </div>
            <p className="text-sm text-neutral-500">
              Model Code: <span className="font-mono text-neutral-800">{product.modelCode}</span> | Brand: {product.brand} | Type: {product.productType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/products/${product.id}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1.5" /> Customer View
            </Button>
          </Link>
          <Link to={`/admin/products/${product.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1.5" /> Edit
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Base Selling Price</span>
          <div className="text-xl font-bold text-neutral-900">
            <CurrencyDisplay amount={product.basePrice} />
          </div>
          <span className="text-xs text-neutral-400">Retail Catalogue Baseline</span>
        </div>

        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Cost Price (Est)</span>
          <div className="text-xl font-bold text-neutral-900">
            <CurrencyDisplay amount={defaultVariant?.costPrice || 1200} />
          </div>
          <span className="text-xs text-emerald-600 font-mono font-medium">
            Margin: {defaultVariant ? (((defaultVariant.sellingPrice - defaultVariant.costPrice) / (defaultVariant.costPrice || 1)) * 100).toFixed(0) : 60}%
          </span>
        </div>

        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Total Available Stock</span>
          <div className="text-xl font-bold font-mono text-neutral-900">{totalStock} units</div>
          <span className="text-xs text-neutral-500">Across {product.variants.length} color variants</span>
        </div>

        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Barcode (Primary)</span>
          <div className="text-sm font-mono font-bold text-neutral-900 flex items-center gap-1.5 mt-1">
            <Barcode className="w-4 h-4 text-neutral-400" />
            {defaultVariant?.barcode || 'N/A'}
          </div>
          <span className="text-xs text-neutral-400">Category: {product.category}</span>
        </div>
      </div>

      {/* Specifications & Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Specs */}
        <div className="bg-white border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Specifications & Fitting
          </h2>
          <dl className="divide-y divide-neutral-100 text-sm">
            <div className="py-2 flex justify-between">
              <dt className="text-neutral-500">Brand</dt>
              <dd className="font-medium text-neutral-900">{product.brand}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-neutral-500">Type</dt>
              <dd className="font-medium text-neutral-900">{product.productType}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-neutral-500">Target Fit</dt>
              <dd className="font-medium text-neutral-900">{product.category}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-neutral-500">Model Code</dt>
              <dd className="font-mono text-neutral-900">{product.modelCode}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-mono text-neutral-900 capitalize">{product.status}</dd>
            </div>
          </dl>

          <div className="pt-2">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 border border-neutral-100">
              {product.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right Column: Variants and Images */}
        <div className="md:col-span-2 bg-white border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Variant Inventory & Colorways
            </h2>
            <span className="text-xs text-neutral-500">{product.variants.length} Registered</span>
          </div>

          <div className="space-y-4">
            {product.variants.map((v) => (
              <div key={v.id} className="border border-neutral-200 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                    {v.images?.[0] ? (
                      <img src={v.images[0]} alt={v.colorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: v.colorHex }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{v.colorName}</span>
                      <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: v.colorHex }} />
                    </div>
                    <div className="text-xs text-neutral-500 font-mono mt-0.5">
                      SKU: {v.variantSku} | Size: {v.size} | Material: {v.material}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider block">Quantity</span>
                    <span className={`font-mono text-base font-bold ${v.stockOnHand <= 3 ? 'text-red-600' : 'text-neutral-900'}`}>
                      {v.stockOnHand} on hand
                    </span>
                  </div>
                  <Link to="/admin/inventory">
                    <Button variant="outline" size="sm">
                      Adjust
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
