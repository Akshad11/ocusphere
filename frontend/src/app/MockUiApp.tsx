import React, { useState } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { MockUiRoutes } from './MockUiRoutes';
import { Store, ShieldCheck, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { mockStore } from '../services/mockApiClient';

const FloatingEnvironmentSwitcher: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [collapsed, setCollapsed] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset mock database to default fixtures? All additions, bookings and sales will revert.')) {
      mockStore.resetAll();
      window.location.reload();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 right-3 z-50 bg-neutral-900 text-white p-2 rounded-full shadow-lg hover:bg-neutral-800 text-xs flex items-center justify-center font-bold tracking-wider"
        title="Show Store / Admin Switcher"
      >
        {isAdmin ? 'ERP' : 'STORE'}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-neutral-300 shadow-xl rounded-lg p-2.5 flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 font-medium text-neutral-800 pr-2 border-r border-neutral-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-neutral-900 font-mono text-[11px]">OcuSphere</span>
      </div>

      <div className="flex items-center gap-1">
        {isAdmin ? (
          <Link
            to="/"
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        ) : (
          <Link
            to="/admin"
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin ERP & POS</span>
          </Link>
        )}

        <button
          onClick={handleResetData}
          className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded transition-colors"
          title="Reset Demo Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setCollapsed(true)}
          className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          title="Minimize Switcher"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const MockUiApp: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
        <MockUiRoutes />
        <FloatingEnvironmentSwitcher />
      </div>
    </BrowserRouter>
  );
};

export default MockUiApp;
