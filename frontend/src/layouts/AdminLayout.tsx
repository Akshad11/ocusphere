import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';
import { StaffRole } from '../types/staff.types';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<StaffRole>('Store Manager');

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Subtle Demo Environment Banner */}
          <div className="mb-4 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded text-[11px] text-neutral-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Demonstration ERP UI — All financial figures and transactions operate in memory.</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 hidden sm:inline">
              VITE_DATA_MODE=mock
            </span>
          </div>

          <Outlet context={{ currentRole }} />
        </main>
      </div>
    </div>
  );
};
