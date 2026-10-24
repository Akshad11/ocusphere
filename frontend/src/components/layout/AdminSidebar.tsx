import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  RotateCcw,
  CalendarCheck,
  Users,
  Glasses,
  PlusCircle,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  GitPullRequestDraft,
  Truck,
  FileSpreadsheet,
  PackageCheck,
  Tag,
  TicketPercent,
  BarChart3,
  Bell,
  ShieldCheck,
  KeyRound,
  Settings,
  History,
  Store,
  RefreshCw,
  X,
} from 'lucide-react';
import { mockStore } from '../../services/mockApiClient';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to initial seed state? This will clear test sales and adjustments.')) {
      mockStore.resetAll();
      window.location.reload();
    }
  };

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Point of Sale (POS)', path: '/admin/pos', icon: ShoppingCart },
        { label: 'Sales History', path: '/admin/sales', icon: Receipt },
        { label: 'Returns & Refunds', path: '/admin/returns', icon: RotateCcw },
        { label: 'Bookings & Pickups', path: '/admin/bookings', icon: CalendarCheck },
      ],
    },
    {
      group: 'Catalog & Inventory',
      items: [
        { label: 'Product Master', path: '/admin/products', icon: Glasses },
        { label: 'New Product', path: '/admin/products/new', icon: PlusCircle },
        { label: 'Stock Overview', path: '/admin/inventory', icon: Boxes },
        { label: 'Stock Movements', path: '/admin/inventory/movements', icon: ArrowLeftRight },
        { label: 'Physical Stocktakes', path: '/admin/inventory/counts', icon: ClipboardList },
        { label: 'Stock Requests', path: '/admin/stock-requests', icon: GitPullRequestDraft },
      ],
    },
    {
      group: 'Purchasing & Supply',
      items: [
        { label: 'Suppliers', path: '/admin/suppliers', icon: Truck },
        { label: 'Purchase Orders', path: '/admin/purchase-orders', icon: FileSpreadsheet },
        { label: 'Goods Receiving', path: '/admin/goods-receipts', icon: PackageCheck },
      ],
    },
    {
      group: 'Customers & Offers',
      items: [
        { label: 'Customer Master', path: '/admin/customers', icon: Users },
        { label: 'Offers & Promos', path: '/admin/offers', icon: Tag },
        { label: 'Coupons', path: '/admin/coupons', icon: TicketPercent },
      ],
    },
    {
      group: 'Intelligence & Admin',
      items: [
        { label: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
        { label: 'Notification Center', path: '/admin/notifications', icon: Bell },
        { label: 'Staff Management', path: '/admin/staff', icon: ShieldCheck },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: KeyRound },
        { label: 'Store Settings', path: '/admin/settings', icon: Settings },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter">
              OS
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-neutral-900 block leading-tight">
                OcuSphere
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono block">
                Retail ERP
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom actions & Demo Badge */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 space-y-2 shrink-0">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Open Customer Storefront</span>
          </Link>
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-neutral-500">
            <span className="font-mono">Demo Mode</span>
            <button
              onClick={handleResetData}
              className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 hover:underline cursor-pointer"
              title="Reset mock data to initial fixture state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
