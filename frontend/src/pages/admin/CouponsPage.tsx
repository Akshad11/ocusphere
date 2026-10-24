import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Copy, Check, Power } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useOffers } from '../../hooks/useOffers';
import { Coupon } from '../../types/offer.types';
import { formatDate } from '../../utils/dates';

export const CouponsPage: React.FC = () => {
  const { coupons, offers, loading, createCoupon } = useOffers();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    offerId: '',
    expiryDate: '2026-12-31',
    usageLimit: 500,
    perCustomerLimit: 1,
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreate = async () => {
    if (!newCoupon.code.trim()) {
      alert('Please enter coupon code string');
      return;
    }
    const targetOffer = offers.find((o) => o.id === newCoupon.offerId) || offers[0];
    await createCoupon({
      code: newCoupon.code.toUpperCase().replace(/\s+/g, ''),
      offerId: targetOffer?.id || 'off-1',
      offerName: targetOffer?.name || 'Festive Promo',
      expiryDate: newCoupon.expiryDate,
      usageLimit: newCoupon.usageLimit,
      perCustomerLimit: newCoupon.perCustomerLimit,
      isActive: true,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/marketing/offers" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Discount & Promo Coupons</h1>
            <p className="text-sm text-neutral-500">
              Unique checkout promo vouchers, seasonal vouchers, and customer loyalty codes
            </p>
          </div>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Coupon Code
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Linked Offer Campaign</th>
              <th className="py-3 px-4">Per Customer Cap</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4 text-center">Redemptions</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/70">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded text-neutral-900">
                      {c.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(c.code)}
                      className="p-1 hover:bg-neutral-200 text-neutral-500 cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 font-bold text-neutral-900">
                  {c.offerName}
                </td>
                <td className="py-3 px-4 font-mono text-neutral-600 text-xs">
                  {c.perCustomerLimit} use per account
                </td>
                <td className="py-3 px-4 font-mono text-neutral-500 text-xs">
                  {formatDate(c.expiryDate)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs">
                  <span className="font-bold text-neutral-900">{c.usedCount}</span>
                  {c.usageLimit && <span className="text-neutral-400"> / {c.usageLimit}</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {c.isActive ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {coupons.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-sm">No coupons configured.</div>
        )}
      </div>

      {/* New Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Discount Coupon">
        <div className="space-y-4">
          <Input
            label="Coupon Code (Auto-caps) *"
            placeholder="e.g. FESTIVE25"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
          />

          <Select
            label="Associated Campaign Offer"
            value={newCoupon.offerId || (offers[0]?.id || '')}
            onChange={(e) => setNewCoupon({ ...newCoupon, offerId: e.target.value })}
            options={offers.map((o) => ({ value: o.id, label: `${o.name} (${o.discountType === 'Percentage' ? `${o.discountValue}%` : `₹${o.discountValue}`})` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expiry Date"
              type="date"
              value={newCoupon.expiryDate}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
            />
            <Input
              label="Total Redemptions Cap"
              type="number"
              value={newCoupon.usageLimit}
              onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Per Customer Usage Limit"
            type="number"
            min={1}
            value={newCoupon.perCustomerLimit}
            onChange={(e) => setNewCoupon({ ...newCoupon, perCustomerLimit: Number(e.target.value) })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Save Coupon</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
