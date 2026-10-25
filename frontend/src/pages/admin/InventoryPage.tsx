import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ArrowUpDown, History, Download, Plus, Filter, Search } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { StockStatusBadge } from '../../components/inventory/StockStatusBadge';
import { useInventory } from '../../hooks/useInventory';
import { exportToCsv } from '../../utils/exportCsv';
import { InventoryItemRow } from '../../services/mockInventoryService';

export const InventoryPage: React.FC = () => {
  const { stockRows, loading, adjustStock } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');

  // Adjustment Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemRow | null>(null);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<'Damaged' | 'Cycle Count Discrepancy' | 'Store Sample' | 'Customer Return' | 'Supplier Correction' | 'Other'>('Cycle Count Discrepancy');
  const [adjusting, setAdjusting] = useState(false);

  const filteredItems = stockRows.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variantSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStock =
      stockLevelFilter === 'all' ||
      (stockLevelFilter === 'low' && item.stockStatus === 'Low Stock') ||
      (stockLevelFilter === 'out' && item.stockStatus === 'Out of Stock') ||
      (stockLevelFilter === 'in_stock' && item.stockStatus === 'In Stock');

    return matchesSearch && matchesCategory && matchesStock;
  });

  const rowsList = Array.isArray(stockRows) ? stockRows : [];
  const totalQuantity = rowsList.reduce((acc, i) => acc + (i.stockOnHand || 0), 0);
  const lowStockCount = rowsList.filter((i) => i.stockStatus === 'Low Stock').length;
  const outOfStockCount = rowsList.filter((i) => i.stockStatus === 'Out of Stock').length;

  const handleOpenAdjust = (item: InventoryItemRow) => {
    setSelectedItem(item);
    setAdjustQty(1);
    setAdjustType('add');
    setAdjustReason('Cycle Count Discrepancy');
    setIsAdjustOpen(true);
  };

  const handleConfirmAdjust = async () => {
    if (!selectedItem || adjustQty <= 0) return;
    setAdjusting(true);
    try {
      await adjustStock({
        variantId: selectedItem.variantId,
        adjustmentType: adjustType,
        quantity: adjustQty,
        reason: adjustReason,
        notes: 'Store supervisor physical count update',
      }, 'Store Supervisor');
      setIsAdjustOpen(false);
    } catch {
      alert('Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const handleExport = () => {
    exportToCsv(
      'ocu-sphere-inventory',
      filteredItems.map((i) => ({
        SKU: i.variantSku,
        Product: i.productName,
        Brand: i.brand,
        Variant: `${i.colorName} (${i.size})`,
        Category: i.category,
        StockOnHand: i.stockOnHand,
        Reserved: i.reservedQuantity,
        Available: i.availableQuantity,
        ReorderLevel: i.reorderLevel,
        Status: i.stockStatus,
      }))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Inventory & Stock Master</h1>
          <p className="text-sm text-neutral-500">Live warehouse and store front stock tracking with reorder triggers</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/inventory/movements">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-1.5" /> Stock Movements
            </Button>
          </Link>
          <Link to="/admin/inventory/requests">
            <Button variant="outline" size="sm">
              <ArrowUpDown className="w-4 h-4 mr-1.5" /> Stock Requests
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Total SKU Items</span>
          <div className="text-2xl font-bold font-mono text-neutral-900">{rowsList.length}</div>
          <span className="text-xs text-neutral-400">Unique product variants</span>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Total Unit Quantity</span>
          <div className="text-2xl font-bold font-mono text-neutral-900">{totalQuantity}</div>
          <span className="text-xs text-neutral-400">Total physical frames & lenses</span>
        </div>
        <div className="bg-white border border-neutral-200 p-4 border-l-4 border-l-amber-500">
          <span className="text-xs text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
          </span>
          <div className="text-2xl font-bold font-mono text-amber-900">{lowStockCount}</div>
          <span className="text-xs text-neutral-500">Below reorder point</span>
        </div>
        <div className="bg-white border border-neutral-200 p-4 border-l-4 border-l-red-500">
          <span className="text-xs text-red-700 uppercase tracking-wider block mb-1 font-semibold">
            Out of Stock
          </span>
          <div className="text-2xl font-bold font-mono text-red-700">{outOfStockCount}</div>
          <span className="text-xs text-neutral-500">Requires PO generation</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search SKU, Product, or Variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Eyeglasses', label: 'Eyeglasses' },
              { value: 'Sunglasses', label: 'Sunglasses' },
              { value: 'Contact Lenses', label: 'Contact Lenses' },
              { value: 'Reading Glasses', label: 'Reading Glasses' },
              { value: 'Accessories', label: 'Accessories' },
            ]}
          />
          <Select
            value={stockLevelFilter}
            onChange={(e) => setStockLevelFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Stock Levels' },
              { value: 'in_stock', label: 'Healthy Stock' },
              { value: 'low', label: 'Low Stock (< Reorder)' },
              { value: 'out', label: 'Out of Stock (0)' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">SKU / Code</th>
              <th className="py-3 px-4">Product & Variant</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">On Hand</th>
              <th className="py-3 px-4 text-center">Reserved</th>
              <th className="py-3 px-4 text-center">Available</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredItems.map((item) => (
              <tr key={item.variantId} className="hover:bg-neutral-50/70 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-neutral-800 font-medium">
                  {item.variantSku}
                </td>
                <td className="py-3 px-4">
                  <Link to={`/admin/products/${item.productId}`} className="font-semibold text-neutral-900 hover:underline">
                    {item.productName}
                  </Link>
                  <span className="block text-xs text-neutral-500">{item.colorName} &bull; {item.size}</span>
                </td>
                <td className="py-3 px-4 text-neutral-600 text-xs">{item.category}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                  {item.stockOnHand}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-neutral-500">
                  {item.reservedQuantity}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                  <span className={item.availableQuantity === 0 ? 'text-red-600' : item.availableQuantity <= item.reorderLevel ? 'text-amber-600' : 'text-neutral-900'}>
                    {item.availableQuantity}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <StockStatusBadge status={item.stockStatus} />
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleOpenAdjust(item)}>
                    Adjust Stock
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No inventory records found matching your filters.
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title={`Adjust Stock: ${selectedItem?.productName || ''}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1">
            <p><strong>SKU:</strong> {selectedItem?.variantSku}</p>
            <p><strong>Variant:</strong> {selectedItem?.colorName} ({selectedItem?.size})</p>
            <p><strong>Current On Hand:</strong> <span className="font-mono font-bold">{selectedItem?.stockOnHand}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Adjustment Mode</label>
              <div className="flex border border-neutral-300">
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${adjustType === 'add' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'}`}
                  onClick={() => setAdjustType('add')}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${adjustType === 'subtract' ? 'bg-red-600 text-white' : 'hover:bg-neutral-100 text-neutral-700'}`}
                  onClick={() => setAdjustType('subtract')}
                >
                  - Deduct
                </button>
              </div>
            </div>
            <div>
              <Input
                label="Units Quantity"
                type="number"
                min={1}
                value={adjustQty}
                onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </div>

          <div>
            <Select
              label="Audit Reason"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value as any)}
              options={[
                { value: 'Cycle Count Discrepancy', label: 'Cycle Count Discrepancy' },
                { value: 'Damaged', label: 'Damaged in Display' },
                { value: 'Store Sample', label: 'Store Sample / Demo' },
                { value: 'Customer Return', label: 'Customer Return Correction' },
                { value: 'Supplier Correction', label: 'Supplier Shortage Correction' },
                { value: 'Other', label: 'Other Operational Correction' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAdjust} isLoading={adjusting}>
              Confirm Adjustment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
