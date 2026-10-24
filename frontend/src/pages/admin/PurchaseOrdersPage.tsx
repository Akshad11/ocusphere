import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { usePurchaseOrders, useSuppliers } from '../../hooks/useSuppliers';
import { formatDate } from '../../utils/dates';
import { exportToCsv } from '../../utils/exportCsv';

export const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, loading, createPurchaseOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New PO Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-11-05');
  const [lineQty, setLineQty] = useState(25);
  const [lineCost, setLineCost] = useState(950);
  const [notes, setNotes] = useState('Please enclose certified batch test reports with packing list.');

  const handleCreatePo = async () => {
    const targetSupplierId = selectedSupplierId || suppliers[0]?.id;
    if (!targetSupplierId) {
      alert('Please select a supplier');
      return;
    }

    await createPurchaseOrder({
      supplierId: targetSupplierId,
      expectedDeliveryDate: expectedDate,
      notes,
      createdByName: 'Rahul Verma (Store Manager)',
      items: [
        {
          variantId: 'var-001-1',
          orderedQuantity: lineQty,
          unitCost: lineCost,
        },
      ],
    });

    setIsModalOpen(false);
  };

  const filtered = purchaseOrders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCsv(
      'ocu-sphere-purchase-orders',
      filtered.map((o) => ({
        PONumber: o.orderNumber,
        Supplier: o.supplierName,
        CreatedDate: o.createdAt,
        ExpectedDate: o.expectedDeliveryDate,
        TotalAmount: o.totalCost,
        Status: o.status,
      }))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Purchase Orders (Procurement)</h1>
          <p className="text-sm text-neutral-500">
            Create vendor POs, approve batches, track delivery statuses, and verify warehouse receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/purchasing/receipts">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-1.5" /> Goods Receipts (GRN)
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" /> Export POs
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Generate PO
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search PO Number, Vendor Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All PO Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'SENT', label: 'Sent to Vendor' },
            { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
            { value: 'RECEIVED', label: 'Fully Received' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">PO Number</th>
              <th className="py-3 px-4">Supplier / Vendor</th>
              <th className="py-3 px-4">Date Created</th>
              <th className="py-3 px-4">Target Delivery</th>
              <th className="py-3 px-4 text-center">Items Qty</th>
              <th className="py-3 px-4 text-right">Total (Incl Tax)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((po) => {
              const totalItems = po.items.reduce((acc, i) => acc + i.orderedQuantity, 0);
              return (
                <tr key={po.id} className="hover:bg-neutral-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-neutral-900">
                    <Link to={`/admin/purchasing/orders/${po.id}`} className="hover:underline">
                      {po.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">
                    {po.supplierName}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-500">
                    {formatDate(po.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-700">
                    {formatDate(po.expectedDeliveryDate)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium">{totalItems} units</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                    <CurrencyDisplay amount={po.totalCost} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        po.status === 'Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'Partially_Received'
                          ? 'bg-blue-100 text-blue-800'
                          : po.status === 'Sent'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {po.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/admin/purchasing/orders/${po.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No purchase orders matching criteria.
          </div>
        )}
      </div>

      {/* New PO Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue New Purchase Order">
        <div className="space-y-4">
          <Select
            label="Select Supplier / Vendor *"
            value={selectedSupplierId || (suppliers[0]?.id || '')}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            options={suppliers.map((s) => ({ value: s.id, label: `${s.businessName} (${s.paymentTerms})` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Order Quantity"
              type="number"
              min={1}
              value={lineQty}
              onChange={(e) => setLineQty(Number(e.target.value))}
            />
            <Input
              label="Unit Cost Price (₹)"
              type="number"
              value={lineCost}
              onChange={(e) => setLineCost(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expected Delivery Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex flex-col justify-center">
              <span>Estimated Total + 12% GST:</span>
              <strong className="text-sm font-mono text-neutral-900">
                ₹{Math.round(lineQty * lineCost * 1.12).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <Input
            label="PO Order Notes / Specifications"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePo}>Generate PO</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
