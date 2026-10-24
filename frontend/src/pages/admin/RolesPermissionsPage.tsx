import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Check, X, Save } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface PermissionRow {
  key: string;
  label: string;
  category: string;
  storeManager: boolean;
  optometrist: boolean;
  salesExecutive: boolean;
  cashier: boolean;
  labTech: boolean;
}

export const RolesPermissionsPage: React.FC = () => {
  const [matrix, setMatrix] = useState<PermissionRow[]>([
    { key: 'pos_checkout', label: 'Create POS Order & Ring Sales', category: 'Sales & POS', storeManager: true, optometrist: false, salesExecutive: true, cashier: true, labTech: false },
    { key: 'pos_discount', label: 'Apply Custom Cashier Discount', category: 'Sales & POS', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: false },
    { key: 'pos_refund', label: 'Authorize Sale Return / Refund', category: 'Sales & POS', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: false },
    
    { key: 'rx_create', label: 'Write & Certify Eye Prescriptions', category: 'Optometry & Clinical', storeManager: false, optometrist: true, salesExecutive: false, cashier: false, labTech: false },
    { key: 'rx_view', label: 'View Customer Optical Prescriptions', category: 'Optometry & Clinical', storeManager: true, optometrist: true, salesExecutive: true, cashier: false, labTech: true },
    { key: 'booking_manage', label: 'Reschedule & Manage Appointments', category: 'Optometry & Clinical', storeManager: true, optometrist: true, salesExecutive: true, cashier: true, labTech: false },

    { key: 'inv_view', label: 'View Stock Balances & Shelves', category: 'Inventory & Catalogue', storeManager: true, optometrist: false, salesExecutive: true, cashier: true, labTech: true },
    { key: 'inv_adjust', label: 'Perform Manual Stock Quantity Adjustments', category: 'Inventory & Catalogue', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: false },
    { key: 'inv_stocktake', label: 'Conduct Physical Cycle Audits', category: 'Inventory & Catalogue', storeManager: true, optometrist: false, salesExecutive: true, cashier: false, labTech: true },

    { key: 'po_create', label: 'Issue Vendor Purchase Orders', category: 'Procurement', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: false },
    { key: 'po_receive', label: 'Receive Goods & Sign GRN', category: 'Procurement', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: true },

    { key: 'reports_view', label: 'Access Revenue & Profit Analytics', category: 'Administration', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: false },
    { key: 'staff_manage', label: 'Manage Staff Logins & Permissions', category: 'Administration', storeManager: true, optometrist: false, salesExecutive: false, cashier: false, labTech: false },
  ]);

  const [saving, setSaving] = useState(false);

  const togglePermission = (rowIdx: number, role: 'storeManager' | 'optometrist' | 'salesExecutive' | 'cashier' | 'labTech') => {
    const updated = [...matrix];
    updated[rowIdx][role] = !updated[rowIdx][role];
    setMatrix(updated);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Security policy updated across all terminal sessions.');
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/staff" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Role-Based Access Control (RBAC)</h1>
            <p className="text-sm text-neutral-500">
              Enforce least-privilege security between optometrists, cashiers, store leads, and lab technicians
            </p>
          </div>
        </div>

        <Button onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4 mr-1.5" /> Save Permission Matrix
        </Button>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Capability / Permission</th>
              <th className="py-3 px-4 text-center">Store Manager</th>
              <th className="py-3 px-4 text-center">Optometrist</th>
              <th className="py-3 px-4 text-center">Sales Consultant</th>
              <th className="py-3 px-4 text-center">Cashier</th>
              <th className="py-3 px-4 text-center">Lab Tech</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {matrix.map((row, idx) => (
              <tr key={row.key} className="hover:bg-neutral-50/70">
                <td className="py-3 px-4">
                  <div className="font-semibold text-neutral-900 text-xs">{row.label}</div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{row.category}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => togglePermission(idx, 'storeManager')}
                    className={`p-1.5 rounded transition-colors ${row.storeManager ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                  >
                    {row.storeManager ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => togglePermission(idx, 'optometrist')}
                    className={`p-1.5 rounded transition-colors ${row.optometrist ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                  >
                    {row.optometrist ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => togglePermission(idx, 'salesExecutive')}
                    className={`p-1.5 rounded transition-colors ${row.salesExecutive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                  >
                    {row.salesExecutive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => togglePermission(idx, 'cashier')}
                    className={`p-1.5 rounded transition-colors ${row.cashier ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                  >
                    {row.cashier ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => togglePermission(idx, 'labTech')}
                    className={`p-1.5 rounded transition-colors ${row.labTech ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                  >
                    {row.labTech ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
