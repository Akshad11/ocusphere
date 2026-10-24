import React, { useState, useEffect } from 'react';
import { Download, Shield, Filter, Search, Terminal } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { formatDateTime } from '../../utils/dates';
import { exportToCsv } from '../../utils/exportCsv';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details?: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    // Generate or fetch audit logs
    const seedLogs: AuditLog[] = [
      { id: 'LOG-8812', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), user: 'Rahul Verma', role: 'STORE_MANAGER', action: 'PRICE_UPDATE', resource: 'PROD-001 (OcuSphere Wayfarer)', ipAddress: '192.168.1.42', status: 'SUCCESS', details: 'Updated selling price from ₹3,199 to ₹2,999' },
      { id: 'LOG-8811', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user: 'Dr. Sunita Rao', role: 'OPTOMETRIST', action: 'RX_CERTIFIED', resource: 'CUST-002 (Vikram Malhotra)', ipAddress: '192.168.1.18', status: 'SUCCESS', details: 'Prescribed Sphere -2.50 OD, -2.75 OS with Blue Light blocking' },
      { id: 'LOG-8810', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), user: 'Aman Patel', role: 'CASHIER', action: 'POS_CHECKOUT', resource: 'INV-2026-1049', ipAddress: '192.168.1.10', status: 'SUCCESS', details: 'Settled ₹4,499 via UPI QR' },
      { id: 'LOG-8809', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), user: 'Pooja Nair', role: 'SALES_EXECUTIVE', action: 'STOCK_TRANSFER_REQUEST', resource: 'REQ-002', ipAddress: '192.168.1.15', status: 'SUCCESS', details: 'Requested 10 units OCU-NAV-004-GOLD from Central Warehouse' },
      { id: 'LOG-8808', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), user: 'System Worker', role: 'SYSTEM', action: 'LOW_STOCK_ALERT', resource: 'OCU-SUN-007-BLK', ipAddress: '127.0.0.1', status: 'WARNING', details: 'Quantity reached threshold (2 <= 3)' },
      { id: 'LOG-8807', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), user: 'Unknown', role: 'GUEST', action: 'FAILED_LOGIN_ATTEMPT', resource: 'Admin Portal', ipAddress: '49.207.181.12', status: 'FAILED', details: '3 consecutive invalid password attempts on user admin@ocusphere.in' },
      { id: 'LOG-8806', timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(), user: 'Rahul Verma', role: 'STORE_MANAGER', action: 'GRN_ACCEPTED', resource: 'GRN-2026-081', ipAddress: '192.168.1.42', status: 'SUCCESS', details: 'Received 50 units Essilor Crizal Sapphire Lenses' },
    ];
    setLogs(seedLogs);
    setLoading(false);
  }, []);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCsv(
      'ocu-sphere-audit-trail',
      filtered.map((l) => ({
        LogID: l.id,
        Timestamp: l.timestamp,
        User: l.user,
        Role: l.role,
        Action: l.action,
        Resource: l.resource,
        IPAddress: l.ipAddress,
        Status: l.status,
        Details: l.details || '',
      }))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Security Audit Trail</h1>
          <p className="text-sm text-neutral-500">
            Immutable system event logs, access attempts, managerial overrides, price changes, and data modifications
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1.5" /> Export Audit Log CSV
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search action, user, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Event Statuses' },
            { value: 'SUCCESS', label: 'Success Only' },
            { value: 'WARNING', label: 'Warnings' },
            { value: 'FAILED', label: 'Failed / Security Alert' },
          ]}
        />
      </div>

      {/* Log Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Event ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User & Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">Audit Details</th>
              <th className="py-3 px-4 text-center">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-mono text-xs">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-neutral-50/70">
                <td className="py-3 px-4 font-bold text-neutral-900">{l.id}</td>
                <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                  {formatDateTime(l.timestamp)}
                </td>
                <td className="py-3 px-4 font-sans">
                  <div className="font-semibold text-neutral-900">{l.user}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{l.role}</div>
                </td>
                <td className="py-3 px-4 font-bold text-neutral-800">{l.action}</td>
                <td className="py-3 px-4 font-sans text-neutral-700">{l.resource}</td>
                <td className="py-3 px-4 font-sans text-neutral-500 max-w-sm truncate">
                  {l.details || '—'}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      l.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm font-sans">No audit events match filters.</div>
        )}
      </div>
    </div>
  );
};
