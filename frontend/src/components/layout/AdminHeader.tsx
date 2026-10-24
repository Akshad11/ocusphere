import React, { useState } from 'react';
import { Menu, ShoppingCart, Bell, UserCheck, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StaffRole } from '../../types/staff.types';
import { useNotifications } from '../../hooks/useNotifications';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  currentRole: StaffRole;
  onRoleChange: (role: StaffRole) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  currentRole,
  onRoleChange,
}) => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const pendingNotifs = notifications.filter((n) => n.status === 'Queued' || n.status === 'Failed').length;

  const roles: StaffRole[] = [
    'Owner/Admin',
    'Store Manager',
    'Cashier',
    'Inventory Staff',
    'Store Assistant',
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left zone: Hamburger + Store badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <span className="font-semibold text-neutral-900">Bandra West Flagship</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">Mumbai, MH</span>
        </div>
      </div>

      {/* Right zone: Simulated role switcher, POS CTA, notifications */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelect(!showRoleSelect)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors border border-neutral-200"
            title="Switch simulated staff role for UI demonstration"
          >
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden md:inline text-neutral-500">Role:</span>
            <span className="font-semibold text-neutral-900">{currentRole}</span>
          </button>

          {showRoleSelect && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-neutral-400">
                Simulated Persona
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowRoleSelect(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 ${
                    currentRole === r ? 'font-semibold text-neutral-900 bg-neutral-100' : 'text-neutral-600'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <UserCheck className="w-3.5 h-3.5 text-neutral-900" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <Link
          to="/admin/notifications"
          className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {pendingNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        {/* POS Shortcut CTA */}
        <button
          onClick={() => navigate('/admin/pos')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Launch POS</span>
        </button>
      </div>
    </header>
  );
};
