import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const [email, setEmail] = useState('rajiv.singhal@ocusphere.in');
  const [password, setPassword] = useState('OcuSphere@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'Owner Admin', email: 'rajiv.singhal@ocusphere.in', pass: 'OcuSphere@2026' },
    { role: 'Store Manager', email: 'kavita.joshi@ocusphere.in', pass: 'OcuSphere@2026' },
    { role: 'Cashier', email: 'aman.patel@ocusphere.in', pass: 'OcuSphere@2026' },
    { role: 'Inventory Staff', email: 'karan.sharma@ocusphere.in', pass: 'OcuSphere@2026' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';

      if (!isMock) {
        // Authenticate via NestJS Backend
        const res: any = await apiClient.post('/auth/login', { email, password });
        const token = res.accessToken || res.data?.accessToken;
        const user = res.user || res.data?.user;

        if (token) {
          apiClient.setToken(token);
          localStorage.setItem('ocusphere_auth_token', token);
        }
        if (user) {
          localStorage.setItem('ocusphere_auth_user', JSON.stringify(user));
        }
      } else {
        // Demo Mock Auth
        localStorage.setItem(
          'ocusphere_auth_user',
          JSON.stringify({
            fullName: 'Rajiv Singhal',
            email,
            role: 'OWNER_ADMIN',
            roleName: 'Owner / Admin',
          }),
        );
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.message ||
          err.error?.message ||
          'Authentication failed. Please verify your email and password.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100 selection:bg-amber-500 selection:text-neutral-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif font-light tracking-wide text-neutral-100">
          OcuSphere <span className="font-sans font-medium text-amber-400 text-sm tracking-wider uppercase ml-1">Portal</span>
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Optical Retail Management, POS Billing & Clinical Records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-neutral-900/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-neutral-800">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300">Staff Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="staff@ocusphere.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-sm rounded-lg transition-all shadow-md hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-neutral-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Admin Workspace</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <p className="text-[11px] text-neutral-400 mb-2 font-medium">Quick Demo Preset Accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.pass);
                  }}
                  className="p-2 text-left bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/60 hover:border-neutral-700 rounded-lg transition-colors group"
                >
                  <div className="font-medium text-neutral-300 group-hover:text-amber-400 text-[11px] truncate">
                    {acc.role}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">{acc.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
