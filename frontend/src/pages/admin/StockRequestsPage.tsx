import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Plus, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { mockInventoryService } from '../../services/mockInventoryService';
import { StockRequest } from '../../types/inventory.types';
import { formatDate } from '../../utils/dates';

export const StockRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    productName: 'OcuSphere Navigator Aviator',
    sku: 'OCU-NAV-004-GOLD',
    quantity: 10,
    urgency: 'Urgent' as 'Standard' | 'Urgent' | 'Critical',
    notes: 'Customer advance reservations surging for weekend',
  });

  useEffect(() => {
    mockInventoryService.getStockRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id: string) => {
    await mockInventoryService.updateStockRequestStatus(id, 'Approved', 'Approved by store manager', 'Rajiv Malhotra (Ops Lead)');
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Approved', approvedBy: 'Rajiv Malhotra (Ops Lead)' } : r))
    );
  };

  const handleReject = async (id: string) => {
    await mockInventoryService.updateStockRequestStatus(id, 'Rejected', 'Stock currently reserved for VIP orders');
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)));
  };

  const handleFulfill = async (id: string) => {
    await mockInventoryService.updateStockRequestStatus(id, 'Received');
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'Received' } : r)));
  };

  const handleCreate = async () => {
    const item = await mockInventoryService.createStockRequest({
      requestedBy: 'Pooja Nair (Store Lead)',
      urgency: newRequest.urgency,
      status: 'Submitted',
      items: [
        {
          id: `sri-${Date.now()}`,
          variantId: 'var-004-1',
          variantSku: newRequest.sku,
          productName: newRequest.productName,
          currentStock: 2,
          requestedQuantity: newRequest.quantity,
          estimatedCost: 1800,
        },
      ],
      notes: newRequest.notes,
    });
    setRequests([item, ...requests]);
    setIsModalOpen(false);
  };

  const filtered = requests.filter((r) => statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/inventory" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Stock Requisitions & Transfer Approval</h1>
            <p className="text-sm text-neutral-500">
              Inter-branch and central warehouse replenishment requests with multi-level signoff
            </p>
          </div>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Request Stock Replenishment
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-neutral-200 p-3 flex gap-2 overflow-x-auto">
        {['ALL', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === st ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {st} ({st === 'ALL' ? requests.length : requests.filter((r) => r.status.toUpperCase() === st).length})
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Req #</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Requested By</th>
              <th className="py-3 px-4">Items / SKUs</th>
              <th className="py-3 px-4 text-center">Total Qty</th>
              <th className="py-3 px-4 text-center">Urgency</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((r) => {
              const totalItems = r.items.reduce((acc, i) => acc + i.requestedQuantity, 0);

              return (
                <tr key={r.id} className="hover:bg-neutral-50/70">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-neutral-900">{r.requestNumber}</td>
                  <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-neutral-900">{r.requestedBy}</td>
                  <td className="py-3 px-4">
                    {r.items.map((it) => (
                      <div key={it.id || it.variantSku} className="text-xs">
                        <span className="font-semibold text-neutral-900">{it.productName}</span>
                        <span className="text-neutral-500 font-mono ml-1">({it.variantSku}) &times; {it.requestedQuantity}</span>
                      </div>
                    ))}
                    {r.notes && <div className="text-[11px] text-neutral-500 italic mt-0.5">&ldquo;{r.notes}&rdquo;</div>}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-base text-neutral-900">
                    {totalItems}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        r.urgency === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : r.urgency === 'Urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {r.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded inline-block ${
                        r.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'Submitted' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            className="!bg-emerald-700 hover:!bg-emerald-800 !text-white text-xs py-1 px-2.5"
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="text-xs py-1 px-2"
                            onClick={() => handleReject(r.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {r.status === 'Approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs py-1 px-2.5"
                          onClick={() => handleFulfill(r.id)}
                        >
                          <Truck className="w-3.5 h-3.5 mr-1" /> Mark Received
                        </Button>
                      )}
                      {r.status === 'Received' && (
                        <span className="text-xs text-emerald-700 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No stock requisitions found in this state.
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Stock Requisition">
        <div className="space-y-4">
          <Input
            label="Product Title & Frame"
            value={newRequest.productName}
            onChange={(e) => setNewRequest({ ...newRequest, productName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              value={newRequest.sku}
              onChange={(e) => setNewRequest({ ...newRequest, sku: e.target.value })}
            />
            <Input
              label="Quantity"
              type="number"
              min={1}
              value={newRequest.quantity}
              onChange={(e) => setNewRequest({ ...newRequest, quantity: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Urgency Priority"
              value={newRequest.urgency}
              onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value as any })}
              options={[
                { value: 'Standard', label: 'Standard (Routine Restock)' },
                { value: 'Urgent', label: 'Urgent (Store Out of Stock)' },
                { value: 'Critical', label: 'Critical (Customer Booking Waiting)' },
              ]}
            />
            <Input
              label="Requisition Justification"
              value={newRequest.notes}
              onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Submit for Approval</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
