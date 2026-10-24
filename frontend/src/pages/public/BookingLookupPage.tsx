import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { Search, Calendar, Store, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const BookingLookupPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookings } = useBookings();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your reference number or mobile number');
      return;
    }

    // Check by reference or by phone
    const match = bookings.find(
      (b) => b.referenceNumber.toUpperCase() === clean || b.customerPhone.includes(query.trim())
    );

    if (match) {
      navigate(`/booking/confirmation/${match.referenceNumber}`);
    } else {
      setError(`No booking found matching "${query}". Try searching by phone (e.g. 9820123456) or reference (e.g. APT-2026-1001).`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8 text-left">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Track Status
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">
          Lookup Appointment or Eyewear Hold
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2">
          Enter your reference code (e.g. APT-2026-1001 / RES-2026-2001) or your 10-digit mobile number to check the latest timeline status.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            label="Reference Number or Phone"
            placeholder="e.g. APT-2026-1001 or 9820123456"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError('');
            }}
            error={error}
            autoFocus
          />

          <Button type="submit" size="lg" className="w-full" icon={<Search className="w-4 h-4" />}>
            Track Reservation / Appointment
          </Button>
        </form>

        {/* Quick sample references for demo test */}
        <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-500 space-y-2">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Try Quick Demo Codes:</span>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[11px]">
            {['APT-2026-1001', 'RES-2026-2001', 'APT-2026-1002', 'RES-2026-2002'].map((code) => (
              <button
                key={code}
                onClick={() => setQuery(code)}
                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-800 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
