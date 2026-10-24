import React, { useState } from 'react';
import { Save, RefreshCw, Store, Printer, Percent, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { resetDemoData } from '../../data/seedData';

export const StoreSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    storeName: 'OcuSphere Flagship Eyewear',
    tagline: 'Precision Vision & Contemporary Eyewear Architecture',
    gstin: '29AABCO1234F1Z5',
    phone: '+91 (080) 4123-8900',
    email: 'flagship.blr@ocusphere.in',
    address: 'Plot #42, 100ft Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    currency: 'INR (₹)',
    defaultTaxRate: 18,
    receiptHeader: 'THANK YOU FOR VISITING OCUSPHERE',
    receiptFooter: '1-Year Manufacturing Warranty on Frames. 30-Day Lens Power Adaptation Guarantee.',
    openTime: '10:00 AM',
    closeTime: '09:30 PM',
  });

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Store settings saved successfully!');
    }, 500);
  };

  const handleResetData = () => {
    if (confirm('Reset all demo state to original seed fixtures? Any new products, sales, or bookings created in this session will revert.')) {
      setResetting(true);
      resetDemoData();
      setTimeout(() => {
        setResetting(false);
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Store Settings & Terminal Configuration</h1>
          <p className="text-sm text-neutral-500">
            Retail identity, tax configurations, printed receipt footers, and environment controls
          </p>
        </div>

        <Button onClick={handleResetData} variant="outline" size="sm" isLoading={resetting}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Reset Demo Fixtures
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
            <Store className="w-4 h-4 text-neutral-500" /> Store Profile & Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Store Brand Name"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
            <Input
              label="Tagline / Brand Claim"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Store Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
            <Input
              label="Store Email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
            <Input
              label="GSTIN Number"
              value={settings.gstin}
              onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
            />
          </div>

          <Input
            label="Street Address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
            />
            <Input
              label="State"
              value={settings.state}
              onChange={(e) => setSettings({ ...settings, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              value={settings.pincode}
              onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
            />
          </div>
        </div>

        {/* Operating Hours & Tax */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
            <Percent className="w-4 h-4 text-neutral-500" /> Operating Hours & Default Taxation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Store Opens"
              value={settings.openTime}
              onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
            />
            <Input
              label="Store Closes"
              value={settings.closeTime}
              onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
            />
            <Select
              label="Default GST Tax"
              value={settings.defaultTaxRate.toString()}
              onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
              options={[
                { value: '5', label: '5% (Lenses)' },
                { value: '12', label: '12% (Standard)' },
                { value: '18', label: '18% (Luxury)' },
              ]}
            />
            <Input
              label="Currency Format"
              value={settings.currency}
              disabled
            />
          </div>
        </div>

        {/* POS Receipt Customizer */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
            <Printer className="w-4 h-4 text-neutral-500" /> 80mm Thermal Receipt Typography
          </h2>

          <div>
            <Input
              label="Receipt Header Sub-line"
              value={settings.receiptHeader}
              onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Receipt Footer & Warranty Terms</label>
            <textarea
              rows={2}
              className="w-full border border-neutral-300 p-2 text-xs focus:outline-none focus:border-neutral-900"
              value={settings.receiptFooter}
              onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
