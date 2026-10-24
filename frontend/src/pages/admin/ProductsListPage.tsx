import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useProducts } from '../../hooks/useProducts';
import { DataTable, Column } from '../../components/common/DataTable';
import { Product } from '../../types/product.types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchInput } from '../../components/common/SearchInput';
import { formatINR } from '../../utils/currency';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Upload, Eye, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importReport, setImportReport] = useState<{
    validCount: number;
    errorCount: number;
    warnings: string[];
  } | null>(null);

  const { products, loading, deleteProduct } = useProducts({
    search: search || undefined,
    productType: typeFilter !== 'all' ? (typeFilter as any) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  const handleSimulateImport = () => {
    if (!importFileName) return;
    setImportReport({
      validCount: 14,
      errorCount: 1,
      warnings: [
        'Row 8: Model OC-TIT-801 has missing reorder threshold; defaulted to 5 units.',
        'Row 15: Duplicate barcode 890100101001 skipped.',
      ],
    });
  };

  const columns: Column<Product>[] = [
    {
      header: 'Model / Code',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-neutral-900 block">{p.modelCode}</span>
          <span className="text-[11px] text-neutral-500">{p.brand}</span>
        </div>
      ),
    },
    {
      header: 'Product Name',
      render: (p) => (
        <div>
          <span className="font-bold text-neutral-900 block">{p.name}</span>
          <span className="text-[11px] text-neutral-500">
            {p.productType} · {p.category}
          </span>
        </div>
      ),
    },
    {
      header: 'Variants',
      align: 'center',
      render: (p) => (
        <span className="font-mono text-xs text-neutral-700">
          {p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'}
        </span>
      ),
    },
    {
      header: 'Base Price',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold tabular-nums text-neutral-900">
          {formatINR(p.basePrice)}
        </span>
      ),
    },
    {
      header: 'Total Stock',
      align: 'right',
      render: (p) => {
        const total = p.variants.reduce((acc, v) => acc + v.stockOnHand, 0);
        const reserved = p.variants.reduce((acc, v) => acc + v.reservedQuantity, 0);
        const available = total - reserved;
        return (
          <div className="text-right">
            <span
              className={`font-mono font-bold tabular-nums block ${
                available <= 0
                  ? 'text-red-700'
                  : available <= 5
                  ? 'text-amber-700'
                  : 'text-neutral-900'
              }`}
            >
              {available} avail
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">({total} on hand)</span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      align: 'center',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/products/${p.id}`)}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/admin/products/${p.id}?edit=true`)}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            title="Edit Frame"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={async () => {
              if (window.confirm(`Delete product "${p.name}"?`)) {
                await deleteProduct(p.id);
              }
            }}
            className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Product Master & Catalogue"
        subtitle="Manage eyewear models, variants, retail pricing, and central catalog definitions."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => {
                setImportFileName('');
                setImportReport(null);
                setIsImportModalOpen(true);
              }}
            >
              Bulk Import CSV
            </Button>
            <Button
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/products/new')}
            >
              Create Product
            </Button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-lg">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search model code, brand, frame name..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="all">All Product Types</option>
            <option value="Eyeglasses">Eyeglasses</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Prescription lenses">Prescription lenses</option>
            <option value="Contact lenses">Contact lenses</option>
            <option value="Accessories">Accessories</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        isLoading={loading}
        onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
      />

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Product Catalogue"
        subtitle="Upload CSV containing SKUs, barcodes, categories, and wholesale pricing."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-left">
          <div className="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center bg-neutral-50/50">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImportFileName(e.target.files[0].name);
                  setImportReport(null);
                }
              }}
              className="text-xs text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-neutral-300 file:bg-white file:text-neutral-800"
            />
            {importFileName && (
              <p className="mt-2 text-xs font-semibold text-neutral-900">
                Selected: {importFileName}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!importFileName}
              onClick={handleSimulateImport}
            >
              Validate & Import File
            </Button>
          </div>

          {importReport && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Simulated Validation Complete: {importReport.validCount} valid records</span>
              </div>
              {importReport.warnings.map((w, idx) => (
                <p key={idx} className="text-[11px] text-amber-800 font-mono">
                  • {w}
                </p>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
