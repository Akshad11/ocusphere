import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useCustomers } from '../../hooks/useCustomers';
import { DataTable, Column } from '../../components/common/DataTable';
import { Customer, CreateCustomerInput } from '../../types/customer.types';
import { SearchInput } from '../../components/common/SearchInput';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { UserPlus, Eye, Users } from 'lucide-react';

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { customers, loading, createCustomer } = useCustomers({ search: search || undefined });

  // Create form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('400050');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !phone) {
      alert('First name and phone number are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createCustomer({
        firstName,
        lastName,
        phone,
        email,
        address: {
          street,
          city,
          state: 'Maharashtra',
          postalCode,
          country: 'India',
        },
        contactPreferences: {
          sms: true,
          whatsapp: true,
          email: !!email,
          marketingConsent,
        },
      });
      setIsCreateOpen(false);
      navigate(`/admin/customers/${created.id}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Code',
      render: (c) => <span className="font-mono font-bold text-neutral-900">{c.customerCode}</span>,
    },
    {
      header: 'Customer Name',
      render: (c) => (
        <div>
          <span className="font-bold text-neutral-900 block">{c.firstName} {c.lastName}</span>
          <span className="text-[11px] text-neutral-500 font-mono">{c.address.city}</span>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (c) => (
        <div className="text-xs">
          <span className="font-mono text-neutral-900 block">{c.phone}</span>
          <span className="text-[11px] text-neutral-400 block">{c.email}</span>
        </div>
      ),
    },
    {
      header: 'Prescriptions',
      align: 'center',
      render: (c) => (
        <span className="font-mono text-xs tabular-nums text-neutral-700">
          {c.prescriptions.length} {c.prescriptions.length === 1 ? 'Rx' : 'Rx entries'}
        </span>
      ),
    },
    {
      header: 'Visits',
      align: 'center',
      render: (c) => <span className="font-mono text-xs tabular-nums">{c.totalVisits}</span>,
    },
    {
      header: 'Total Spent',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold tabular-nums text-neutral-900">
          {formatINR(c.totalSpent)}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (c) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/customers/${c.id}`);
          }}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
          title="View Customer Profile"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Customer Master"
        subtitle="Manage client demographics, optical prescriptions, and visit histories."
        actions={
          <Button
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Register Customer
          </Button>
        }
      />

      <div className="w-full sm:w-80">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone, code, or email..."
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        isLoading={loading}
        onRowClick={(c) => navigate(`/admin/customers/${c.id}`)}
      />

      {/* Customer Registration Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Customer"
        subtitle="Create an optometric patient record for prescriptions and POS checkout."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Phone *"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="Street Address"
            placeholder="Flat, building, road"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="PIN Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="rounded border-neutral-300"
              />
              <span>Customer consented to SMS & WhatsApp order/appointment alerts</span>
            </label>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Create Customer File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
