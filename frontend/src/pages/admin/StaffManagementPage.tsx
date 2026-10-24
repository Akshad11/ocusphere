import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, Mail, Phone } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useStaff } from '../../hooks/useStaff';
import { StaffMember, StaffRole } from '../../types/staff.types';

export const StaffManagementPage: React.FC = () => {
  const { staff, loading, createStaff, updateStaff } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Store Assistant' as StaffRole,
  });

  const filtered = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newStaff.fullName.trim() || !newStaff.email.trim()) {
      alert('Please fill out employee name and email');
      return;
    }
    await createStaff({
      ...newStaff,
      isActive: true,
      permissions: ['pos_access'],
    });
    setIsModalOpen(false);
    setNewStaff({
      fullName: '',
      email: '',
      phone: '',
      role: 'Store Assistant',
    });
  };

  const toggleStatus = async (member: StaffMember) => {
    await updateStaff(member.id, { isActive: !member.isActive });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Staff & Team Directory</h1>
          <p className="text-sm text-neutral-500">
            Store managers, registered optometrists, optical lab technicians, and cashier staff
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/staff/roles">
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-1.5" /> Roles & Permissions Matrix
            </Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Staff Member
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-neutral-200 p-4">
        <Input
          placeholder="Search employee name, role, email, or badge ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Badge / ID</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role Title</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-neutral-50/70">
                <td className="py-3 px-4 font-mono font-bold text-xs text-neutral-900">{s.employeeCode}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-neutral-900">{s.fullName}</div>
                  <div className="text-xs text-neutral-500 font-mono">{s.email}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                    {s.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs font-mono text-neutral-600">{s.phone}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {s.isActive ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => toggleStatus(s)}
                  >
                    {s.isActive ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">No employees match this query.</div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard Optical Employee">
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={newStaff.fullName}
            onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
            placeholder="e.g. Dr. Priya Sundaram"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Work Email *"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              placeholder="e.g. priya@ocusphere.in"
            />
            <Input
              label="Contact Phone"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <Select
              label="System Role"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as StaffRole })}
              options={[
                { value: 'Owner/Admin', label: 'Owner / Executive Admin' },
                { value: 'Store Manager', label: 'Store Manager' },
                { value: 'Cashier', label: 'Cashier' },
                { value: 'Inventory Staff', label: 'Inventory Staff' },
                { value: 'Store Assistant', label: 'Store Assistant' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add Employee</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
