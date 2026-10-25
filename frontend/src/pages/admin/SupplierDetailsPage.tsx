import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { mockSupplierService } from '../../services/mockSupplierService';
import { mockPurchaseOrderService } from '../../services/mockPurchaseOrderService';
import { Supplier } from '../../types/supplier.types';
import { PurchaseOrder } from '../../types/purchasing.types';
import { formatDate } from '../../utils/dates';

export const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        mockSupplierService.getById(id),
        mockPurchaseOrderService.list({ supplierId: id }),
      ])
        .then(([s, pos]) => {
          setSupplier(s || null);
          setOrders(Array.isArray(pos) ? pos : (pos as any)?.items || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-neutral-500 text-center">Loading supplier data...</div>;
  }

  if (!supplier) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Supplier not found.</p>
        <Link to="/admin/suppliers" className="text-neutral-900 underline">
          Back to Suppliers List
        </Link>
      </div>
    );
  }

  const ordersList = Array.isArray(orders) ? orders : [];
  const totalSpend = ordersList.reduce((acc, po: PurchaseOrder) => acc + (po.totalCost || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/suppliers" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{supplier.businessName}</h1>
            <p className="text-sm text-neutral-500">
              Vendor Code: <span className="font-mono text-neutral-800">{supplier.id}</span> | GSTIN: {supplier.taxId}
            </p>
          </div>
        </div>

        <Link to="/admin/purchasing/orders">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Issue Purchase Order
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Total Orders</span>
          <div className="text-2xl font-bold font-mono text-neutral-900">{ordersList.length}</div>
          <span className="text-xs text-neutral-400">POs Issued</span>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Lifetime Volume</span>
          <div className="text-xl font-bold text-neutral-900">
            <CurrencyDisplay amount={totalSpend} />
          </div>
          <span className="text-xs text-neutral-400">Gross Procurement</span>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Status</span>
          <div className="text-xl font-bold text-neutral-900">{supplier.isActive ? 'Active' : 'Inactive'}</div>
          <span className="text-xs text-neutral-400">Operational Vendor</span>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Payment Terms</span>
          <div className="text-lg font-bold font-mono text-neutral-900">{supplier.paymentTerms}</div>
          <span className="text-xs text-neutral-400">Credit Agreement</span>
        </div>
      </div>

      {/* Company Info & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Contact & Address</h2>
          <div className="space-y-2 text-sm text-neutral-700">
            <p><strong>Contact Person:</strong> {supplier.contactPerson}</p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>{supplier.phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>{supplier.email}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span>{supplier.address}, {supplier.city}, {supplier.state}</span>
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Purchase Order History</h2>
            <span className="text-xs text-neutral-500">{ordersList.length} orders recorded</span>
          </div>

          <div className="space-y-3">
            {ordersList.map((po) => (
              <div key={po.id} className="p-3 border border-neutral-200 flex items-center justify-between hover:bg-neutral-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">{po.orderNumber}</span>
                    <span className="text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Issued: {formatDate(po.createdAt)} &bull; Expected Delivery: {formatDate(po.expectedDeliveryDate)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-neutral-900 text-sm">
                    <CurrencyDisplay amount={po.totalCost} />
                  </div>
                  <Link to={`/admin/purchasing/orders/${po.id}`} className="text-xs text-neutral-900 underline font-medium">
                    View PO
                  </Link>
                </div>
              </div>
            ))}

            {ordersList.length === 0 && (
              <p className="text-xs text-neutral-500 py-4 text-center">No purchase orders issued to this vendor yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
