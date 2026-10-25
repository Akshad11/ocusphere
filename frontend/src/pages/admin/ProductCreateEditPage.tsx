import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { mockProductService } from '../../services/mockProductService';
import { ProductType, PublicationStatus } from '../../types/product.types';

export const ProductCreateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Unisex',
    productType: 'Eyeglasses' as ProductType,
    modelCode: `MOD-${Date.now().toString().slice(-4)}`,
    basePrice: 2999,
    description: '',
    status: 'published' as PublicationStatus,
    images: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    variants: [
      {
        variantSku: `SKU-${Date.now().toString().slice(-6)}-BLK`,
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        colorName: 'Matte Black',
        colorHex: '#1C1C1E',
        size: 'Medium',
        material: 'Titanium',
        sellingPrice: 2999,
        costPrice: 1200,
        initialStock: 12,
        reorderLevel: 3,
        images: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
      },
    ],
  });

  useEffect(() => {
    if (isEditing && id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const fetchPromise = isUuid
        ? mockProductService.getById(id).catch(() => mockProductService.getBySlug(id))
        : mockProductService.getBySlug(id).catch(() => mockProductService.getById(id));

      fetchPromise
        .then((p) => {
          if (p) {
            setFormData({
              name: p.name,
              brand: p.brand,
              category: p.category,
              productType: p.productType,
              modelCode: p.modelCode,
              basePrice: p.basePrice,
              description: p.description,
              status: p.status,
              images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
              variants: (p.variants || []).map((v) => ({
                variantSku: v.variantSku,
                barcode: v.barcode,
                colorName: v.colorName,
                colorHex: v.colorHex,
                size: v.size,
                material: v.material,
                sellingPrice: v.sellingPrice,
                costPrice: v.costPrice,
                initialStock: v.stockOnHand,
                reorderLevel: v.reorderLevel,
                images: v.images,
                isAvailable: v.isAvailable,
              })),
            });
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Product not found');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim() || !formData.modelCode.trim()) {
      alert('Please fill out Product Name, Brand, and Model Code');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && id) {
        await mockProductService.update(id, {
          id,
          ...formData,
        });
        navigate(`/admin/products/${id}`);
      } else {
        const newProduct = await mockProductService.create({
          ...formData,
        });
        navigate(`/admin/products/${newProduct.id}`);
      }
    } catch {
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          variantSku: `${prev.modelCode}-TOR-${(prev.variants || []).length + 1}`,
          barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
          colorName: 'Tortoise Brown',
          colorHex: '#603813',
          size: 'Medium',
          material: 'Titanium',
          sellingPrice: prev.basePrice,
          costPrice: 1200,
          initialStock: 10,
          reorderLevel: 3,
          images: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
          isAvailable: true,
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if ((formData.variants || []).length <= 1) {
      alert('At least one variant is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 text-center">Loading product data...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/admin/products" className="text-neutral-900 underline font-medium">
          Back to Products List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={isEditing ? `/admin/products/${id}` : '/admin/products'}
            className="p-2 border border-neutral-200 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {isEditing ? `Edit: ${formData.name}` : 'Create New Eyewear Product'}
            </h1>
            <p className="text-sm text-neutral-500">
              {isEditing ? 'Modify master catalogue specifications and variants' : 'Add frame, sunglasses, or contact lens to catalogue'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && (
            <Link to={`/admin/products/${id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1.5" /> View Product
              </Button>
            </Link>
          )}
          <Button onClick={handleSubmit} isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Product Title *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. OcuSphere Titanium Voyager"
                required
              />
            </div>
            <div>
              <Input
                label="Brand *"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. OcuSphere, Ray-Ban"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Product Type"
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })}
              options={[
                { value: 'Eyeglasses', label: 'Eyeglasses' },
                { value: 'Sunglasses', label: 'Sunglasses' },
                { value: 'Prescription lenses', label: 'Prescription lenses' },
                { value: 'Contact lenses', label: 'Contact lenses' },
                { value: 'Accessories', label: 'Accessories' },
              ]}
            />
            <Select
              label="Target Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Unisex', label: 'Unisex' },
                { value: 'Men', label: 'Men' },
                { value: 'Women', label: 'Women' },
                { value: 'Kids', label: 'Kids' },
                { value: 'Designer', label: 'Designer' },
              ]}
            />
            <Input
              label="Model Code *"
              value={formData.modelCode}
              onChange={(e) => setFormData({ ...formData, modelCode: e.target.value })}
              required
            />
            <Input
              label="Base Retail Price (₹) *"
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Product Description</label>
            <textarea
              rows={3}
              className="w-full border border-neutral-300 p-2.5 text-sm focus:border-neutral-900 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed optical description, materials, hinge mechanism, warranty notes..."
            />
          </div>
        </div>

        {/* Variants & Stock */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Color Variants & Inventory</h2>
              <p className="text-xs text-neutral-500">Add colorways, sizes, and initial stock quantities</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="w-4 h-4 mr-1" /> Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((v, idx) => (
              <div key={idx} className="p-4 border border-neutral-200 bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span className="text-sm font-semibold text-neutral-900">
                      Variant #{idx + 1}: {v.colorName} ({v.size})
                    </span>
                  </div>
                  {(formData.variants || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Input
                    label="Color Name"
                    value={v.colorName}
                    onChange={(e) => {
                      const updated = [...formData.variants];
                      updated[idx].colorName = e.target.value;
                      setFormData({ ...formData, variants: updated });
                    }}
                  />
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Color Code (HEX)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={v.colorHex}
                        onChange={(e) => {
                          const updated = [...formData.variants];
                          updated[idx].colorHex = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="w-9 h-9 border border-neutral-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={v.colorHex}
                        onChange={(e) => {
                          const updated = [...formData.variants];
                          updated[idx].colorHex = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="flex-1 border border-neutral-300 px-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <Select
                    label="Frame Size"
                    value={v.size}
                    onChange={(e) => {
                      const updated = [...formData.variants];
                      updated[idx].size = e.target.value;
                      setFormData({ ...formData, variants: updated });
                    }}
                    options={[
                      { value: 'Narrow', label: 'Narrow' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Wide', label: 'Wide' },
                      { value: 'One Size', label: 'One Size' },
                    ]}
                  />
                  <Input
                    label="Selling Price (₹)"
                    type="number"
                    value={v.sellingPrice}
                    onChange={(e) => {
                      const updated = [...formData.variants];
                      updated[idx].sellingPrice = Number(e.target.value);
                      setFormData({ ...formData, variants: updated });
                    }}
                  />
                  <Input
                    label="Initial Stock"
                    type="number"
                    value={v.initialStock}
                    onChange={(e) => {
                      const updated = [...formData.variants];
                      updated[idx].initialStock = Number(e.target.value);
                      setFormData({ ...formData, variants: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status flags */}
        <div className="bg-white border border-neutral-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Select
              label="Publication Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PublicationStatus })}
              options={[
                { value: 'published', label: 'Published (Active in Store & POS)' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};
