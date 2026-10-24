import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Ticket, Power } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useOffers } from '../../hooks/useOffers';
import { DiscountType, Offer } from '../../types/offer.types';
import { formatDate } from '../../utils/dates';

export const OffersManagementPage: React.FC = () => {
  const { offers, loading, updateOffer, createOffer } = useOffers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'Percentage' as DiscountType,
    discountValue: 20,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    minimumPurchase: 2999,
    applicableCategory: 'Eyeglasses',
    isActive: true,
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Please provide offer name');
      return;
    }
    await createOffer({
      ...formData,
      usageLimit: 500,
    });
    setIsModalOpen(false);
  };

  const toggleOfferStatus = async (offer: Offer) => {
    await updateOffer(offer.id, { isActive: !offer.isActive });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Promotions & Marketing Offers</h1>
          <p className="text-sm text-neutral-500">
            Configure seasonal sales, BOGO frame bundles, festive campaigns, and banner announcements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/marketing/coupons">
            <Button variant="outline" size="sm">
              <Ticket className="w-4 h-4 mr-1.5" /> Coupon Codes Master
            </Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Launch New Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-neutral-400 block">{offer.id}</span>
                  <h3 className="font-bold text-neutral-900 text-lg leading-snug">{offer.name}</h3>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded shadow-sm ${
                    offer.isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-600 text-white'
                  }`}
                >
                  {offer.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <p className="text-xs text-neutral-600">{offer.description}</p>

              <div className="p-3 bg-neutral-50 border border-neutral-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Discount Benefit:</span>
                  <strong className="text-neutral-900 font-mono">
                    {offer.discountType === 'Percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Min Purchase:</span>
                  <strong className="text-neutral-900 font-mono">
                    {offer.minimumPurchase ? `₹${offer.minimumPurchase.toLocaleString('en-IN')}` : 'None'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Active Duration:</span>
                  <span className="text-neutral-700 font-mono">
                    {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 text-neutral-600">
                  <span>Times Redeemed:</span>
                  <strong className="font-mono text-neutral-900">{offer.usedCount || 0} times</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                {offer.applicableCategory || 'All Categories'}
              </span>

              <Button
                variant={offer.isActive ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleOfferStatus(offer)}
              >
                <Power className="w-3.5 h-3.5 mr-1" />
                {offer.isActive ? 'Pause' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* New Campaign Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Promotion Campaign">
        <div className="space-y-4">
          <Input
            label="Campaign Headline *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Festive Diwali Golden Sight 2026"
          />

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Marketing Description</label>
            <textarea
              rows={2}
              className="w-full border border-neutral-300 p-2 text-xs focus:outline-none focus:border-neutral-900"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Flat 25% off on all anti-reflective blue-blocker lenses and frames."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Benefit Type"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
              options={[
                { value: 'Percentage', label: 'Percentage (%) OFF' },
                { value: 'Fixed_Amount', label: 'Fixed Amount (₹)' },
                { value: 'Category_Specific', label: 'Category Specific' },
              ]}
            />
            <Input
              label="Discount Value"
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Minimum Purchase Value (₹)"
            type="number"
            value={formData.minimumPurchase}
            onChange={(e) => setFormData({ ...formData, minimumPurchase: Number(e.target.value) })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Launch Campaign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
