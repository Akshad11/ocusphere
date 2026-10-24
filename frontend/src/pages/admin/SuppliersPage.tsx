import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Phone, Mail, MapPin, ExternalLink, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useSuppliers } from '../../hooks/useSuppliers';
import { exportToCsv } from '../../utils/exportCsv';
import { CreateSupplierInput } from '../../types/supplier.types';

export const SuppliersPage: React.FC = () => {
  const { suppliers, loading, createSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<CreateSupplierInput>({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    paymentTerms: 'Net 30',
    isActive: true,
  });

  const filtered = suppliers.filter(
    (s) =>
      s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newSupplier.businessName || !newSupplier.phone) {
      alert('Please provide supplier company name and phone number');
      return;
    }
    await createSupplier(newSupplier);
    setIsModalOpen(false);
  };

  const handleExport = () => {
    exportToCsv(
      'ocu-sphere-suppliers',
      filtered.map((s) => ({
        ID: s.id,
        Name: s.businessName,
        Contact: s.contactPerson,
        Phone: s.phone,
        Email: s.email,
        GSTIN: s.taxId,
        City: s.city,
        State: s.state,
        PaymentTerms: s.paymentTerms,
      }))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Vendors & Optical Suppliers</h1>
          <p className="text-sm text-neutral-500">
            Manage lens laboratories, frame manufacturers, contact lens importers, and accessory vendors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" /> Export Suppliers
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add New Supplier
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-neutral-200 p-4">
        <Input
          placeholder="Search supplier company name, contact person, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((supplier) => (
          <div key={supplier.id} className="bg-white border border-neutral-200 p-5 flex flex-col justify-between hover:border-neutral-400 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-neutral-400">{supplier.id}</span>
                  <h3 className="font-bold text-neutral-900 text-lg leading-tight">{supplier.businessName}</h3>
                </div>
                <span className="text-xs font-semibold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">{supplier.contactPerson}</span>
                  <span className="text-neutral-400">&bull;</span>
                  <span className="font-mono">{supplier.paymentTerms}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500 truncate">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{supplier.city}, {supplier.state}</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  GSTIN / Tax ID: {supplier.taxId}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
              <Link to={`/admin/suppliers/${supplier.id}`} className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1">
                View Account & Orders <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/purchasing/orders">
                <Button variant="outline" size="sm" className="text-xs">
                  Create PO
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* New Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Optical Supplier">
        <div className="space-y-4">
          <Input
            label="Supplier Legal Entity Name *"
            value={newSupplier.businessName}
            onChange={(e) => setNewSupplier({ ...newSupplier, businessName: e.target.value })}
            placeholder="e.g. Essilor India Optics Pvt Ltd"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Primary Contact Person"
              value={newSupplier.contactPerson}
              onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
            />
            <Input
              label="Contact Phone *"
              value={newSupplier.phone}
              onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              type="email"
              value={newSupplier.email}
              onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
            />
            <Input
              label="GSTIN Number"
              value={newSupplier.taxId}
              onChange={(e) => setNewSupplier({ ...newSupplier, taxId: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={newSupplier.city}
              onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
            />
            <Input
              label="State"
              value={newSupplier.state}
              onChange={(e) => setNewSupplier({ ...newSupplier, state: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payment Terms"
              value={newSupplier.paymentTerms}
              onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value as any })}
              options={[
                { value: 'Immediate', label: 'Immediate / Advance' },
                { value: 'Net 15', label: 'Net 15 Days' },
                { value: 'Net 30', label: 'Net 30 Days' },
                { value: 'Net 60', label: 'Net 60 Days' },
              ]}
            />
            <Input
              label="Address"
              value={newSupplier.address}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Save Supplier</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
