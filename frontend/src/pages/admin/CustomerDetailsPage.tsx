import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useCustomer } from '../../hooks/useCustomers';
import { useSales } from '../../hooks/useSales';
import { useBookings } from '../../hooks/useBookings';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookingStatusBadge } from '../../components/bookings/BookingStatusBadge';
import { User, Glasses, Calendar, Receipt, Plus, Eye, ShieldCheck } from 'lucide-react';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, loading, error, addPrescription } = useCustomer(id || '');
  const { sales } = useSales();
  const { bookings } = useBookings();

  const [isAddRxOpen, setIsAddRxOpen] = useState(false);
  const [odSph, setOdSph] = useState('-2.00');
  const [odCyl, setOdCyl] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0');
  const [odAdd, setOdAdd] = useState('');
  const [osSph, setOsSph] = useState('-2.00');
  const [osCyl, setOsCyl] = useState('0.00');
  const [osAxis, setOsAxis] = useState('0');
  const [osAdd, setOsAdd] = useState('');
  const [pd, setPd] = useState('63');
  const [nearPd, setNearPd] = useState('');
  const [optometrist, setOptometrist] = useState('Dr. Neha Kulkarni, M.Optom');
  const [lensNotes, setLensNotes] = useState('');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  if (loading) return <LoadingState message="Loading patient profile..." />;
  if (error || !customer) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Customer record not found"
          message={error || 'Customer record could not be found.'}
          onRetry={() => navigate('/admin/customers')}
        />
      </div>
    );
  }

  // Related customer data
  const customerSales = sales.filter((s) => s.customer?.id === customer.id || s.customer?.phone === customer.phone);
  const customerBookings = bookings.filter((b) => b.customerId === customer.id || b.customerPhone === customer.phone);

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRx(true);
    try {
      await addPrescription({
        recordedDate: new Date().toISOString().split('T')[0],
        optometristName: optometrist,
        clinicOrBranch: 'OcuSphere Flagship, Bandra',
        rightEye: { sph: odSph, cyl: odCyl, axis: odAxis, add: odAdd || undefined },
        leftEye: { sph: osSph, cyl: osCyl, axis: osAxis, add: osAdd || undefined },
        pupillaryDistance: parseFloat(pd) || 62,
        nearPd: nearPd ? parseFloat(nearPd) : undefined,
        notes: lensNotes || undefined,
      });
      setIsAddRxOpen(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to record prescription');
    } finally {
      setIsSubmittingRx(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={`Patient Code: ${customer.customerCode} · Registered on ${formatDate(customer.createdAt)}`}
        breadcrumbs={[
          { label: 'Customer Master', path: '/admin/customers' },
          { label: `${customer.firstName} ${customer.lastName}` },
        ]}
        actions={
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddRxOpen(true)}
          >
            Record New Prescription
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Demographic Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-neutral-700">
              Demographic Profile
            </h3>

            <div className="space-y-2 text-neutral-700">
              <div>
                <span className="text-[11px] text-neutral-400 block uppercase font-mono">Mobile Phone</span>
                <span className="font-mono text-sm font-semibold text-neutral-900">{customer.phone}</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block uppercase font-mono">Email Address</span>
                <span className="text-neutral-900">{customer.email || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block uppercase font-mono">Address</span>
                <p className="text-neutral-700 leading-relaxed">
                  {customer.address.street}, {customer.address.city}, {customer.address.state} - {customer.address.postalCode}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-1.5">
              <span className="text-[11px] text-neutral-400 block uppercase font-mono">
                Consent & Notifications
              </span>
              <div className="space-y-1 text-neutral-600">
                <div>SMS Alerts: {customer.contactPreferences.sms ? 'Opted In' : 'Disabled'}</div>
                <div>WhatsApp: {customer.contactPreferences.whatsapp ? 'Opted In' : 'Disabled'}</div>
                <div>Marketing: {customer.contactPreferences.marketingConsent ? 'Consented' : 'Refused'}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-400 block font-mono">Lifetime Visits</span>
                <span className="text-sm font-bold font-mono">{customer.totalVisits}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-mono">Total Spend</span>
                <span className="text-sm font-bold font-mono text-neutral-900">{formatINR(customer.totalSpent)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription & Clinical History (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Prescription Records */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Glasses className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900">Optical Prescription History</h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {customer.prescriptions.length} Recorded Refractions
              </span>
            </div>

            {customer.prescriptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No optical prescriptions recorded yet. Click "Record New Prescription" to add doctor notes.
              </div>
            ) : (
              <div className="space-y-4">
                {customer.prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-neutral-900">{rx.optometristName}</span>
                        <span className="text-neutral-500 ml-2 font-mono">{rx.recordedDate}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-neutral-800">
                        PD: {rx.pupillaryDistance} mm {rx.nearPd ? `(Near: ${rx.nearPd} mm)` : ''}
                      </span>
                    </div>

                    {/* Prescription Grid Table */}
                    <table className="w-full text-center text-xs border border-neutral-200 rounded overflow-hidden bg-white">
                      <thead className="bg-neutral-100 text-neutral-700 font-mono text-[11px]">
                        <tr>
                          <th className="py-1 px-2 text-left">Eye</th>
                          <th className="py-1 px-2">SPH</th>
                          <th className="py-1 px-2">CYL</th>
                          <th className="py-1 px-2">AXIS</th>
                          <th className="py-1 px-2">ADD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 font-mono">
                        <tr>
                          <td className="py-1.5 px-2 text-left font-bold text-neutral-900">Right (OD)</td>
                          <td className="py-1.5 px-2">{rx.rightEye.sph}</td>
                          <td className="py-1.5 px-2">{rx.rightEye.cyl}</td>
                          <td className="py-1.5 px-2">{rx.rightEye.axis}°</td>
                          <td className="py-1.5 px-2">{rx.rightEye.add || '—'}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-left font-bold text-neutral-900">Left (OS)</td>
                          <td className="py-1.5 px-2">{rx.leftEye.sph}</td>
                          <td className="py-1.5 px-2">{rx.leftEye.cyl}</td>
                          <td className="py-1.5 px-2">{rx.leftEye.axis}°</td>
                          <td className="py-1.5 px-2">{rx.leftEye.add || '—'}</td>
                        </tr>
                      </tbody>
                    </table>

                    {rx.notes && (
                      <p className="text-[11px] text-neutral-600 italic">
                        Optometrist Note: {rx.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Sales & Bookings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sales */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="font-bold text-neutral-900">Purchase Invoices</span>
                <span className="font-mono">{customerSales.length}</span>
              </div>
              {customerSales.length === 0 ? (
                <p className="text-neutral-400 py-3 text-center">No purchases recorded</p>
              ) : (
                customerSales.map((s) => (
                  <Link
                    key={s.id}
                    to={`/admin/sales/${s.id}`}
                    className="flex justify-between py-1 hover:text-neutral-900 text-neutral-700"
                  >
                    <span className="font-mono">{s.invoiceNumber}</span>
                    <span className="font-mono font-bold">{formatINR(s.grandTotal)}</span>
                  </Link>
                ))
              )}
            </div>

            {/* Bookings */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="font-bold text-neutral-900">Bookings & Pickups</span>
                <span className="font-mono">{customerBookings.length}</span>
              </div>
              {customerBookings.length === 0 ? (
                <p className="text-neutral-400 py-3 text-center">No bookings on file</p>
              ) : (
                customerBookings.map((b) => (
                  <Link
                    key={b.id}
                    to={`/admin/bookings/${b.id}`}
                    className="flex justify-between py-1 hover:text-neutral-900 text-neutral-700"
                  >
                    <span className="font-mono">{b.referenceNumber}</span>
                    <span className="font-medium text-[11px]">{b.status}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Prescription Modal */}
      <Modal
        isOpen={isAddRxOpen}
        onClose={() => setIsAddRxOpen(false)}
        title="Record Clinical Optical Prescription"
        subtitle={`Patient: ${customer.firstName} ${customer.lastName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSavePrescription} className="space-y-4 text-xs text-left">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Consulting Optometrist / Doctor"
              value={optometrist}
              onChange={(e) => setOptometrist(e.target.value)}
              required
            />
            <Input
              label="Pupillary Distance (PD in mm) *"
              type="number"
              value={pd}
              onChange={(e) => setPd(e.target.value)}
              required
            />
          </div>

          {/* Right Eye (OD) */}
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-900 block">Right Eye (OD - Oculus Dexter)</span>
            <div className="grid grid-cols-4 gap-2">
              <Input label="SPH" value={odSph} onChange={(e) => setOdSph(e.target.value)} required />
              <Input label="CYL" value={odCyl} onChange={(e) => setOdCyl(e.target.value)} />
              <Input label="AXIS" value={odAxis} onChange={(e) => setOdAxis(e.target.value)} />
              <Input label="ADD" value={odAdd} onChange={(e) => setOdAdd(e.target.value)} placeholder="+1.50" />
            </div>
          </div>

          {/* Left Eye (OS) */}
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-900 block">Left Eye (OS - Oculus Sinister)</span>
            <div className="grid grid-cols-4 gap-2">
              <Input label="SPH" value={osSph} onChange={(e) => setOsSph(e.target.value)} required />
              <Input label="CYL" value={osCyl} onChange={(e) => setOsCyl(e.target.value)} />
              <Input label="AXIS" value={osAxis} onChange={(e) => setOsAxis(e.target.value)} />
              <Input label="ADD" value={osAdd} onChange={(e) => setOsAdd(e.target.value)} placeholder="+1.50" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Optometrist Recommendations / Notes
            </label>
            <textarea
              rows={2}
              value={lensNotes}
              onChange={(e) => setLensNotes(e.target.value)}
              placeholder="e.g. Recommended Zeiss SmartLife 1.60 with DuraVision Platinum AR coating."
              className="w-full border border-neutral-300 rounded p-2 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddRxOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmittingRx}>
              Save Optical Prescription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
