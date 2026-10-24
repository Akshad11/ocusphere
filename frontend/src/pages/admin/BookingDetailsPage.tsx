import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useBooking } from '../../hooks/useBookings';
import { BookingStatus } from '../../types/booking.types';
import { BookingStatusBadge } from '../../components/bookings/BookingStatusBadge';
import { BookingTimeline } from '../../components/bookings/BookingTimeline';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatINR } from '../../utils/currency';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { DatePicker } from '../../components/common/DatePicker';
import { Select } from '../../components/common/Select';
import { getAvailableTimeSlots } from '../../utils/dates';
import { Calendar, Store, User, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, loading, error, updateStatus } = useBooking(id || '');

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(getAvailableTimeSlots()[0]);
  const [actionNote, setActionNote] = useState('');

  if (loading) return <LoadingState message="Loading booking record..." />;
  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Booking not found"
          message={error || 'Booking record could not be found.'}
          onRetry={() => navigate('/admin/bookings')}
        />
      </div>
    );
  }

  const isAppointment = booking.bookingType === 'appointment';

  const handleStatusTransition = async (nextStatus: BookingStatus, defaultNote: string) => {
    try {
      await updateStatus(nextStatus, actionNote || defaultNote, 'Store Manager (Kavita)');
      setActionNote('');
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  };

  const timeSlotOptions = getAvailableTimeSlots().map((s) => ({ label: s, value: s }));

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`${booking.referenceNumber} — ${isAppointment ? 'Appointment' : 'Product Hold'}`}
        subtitle={`Created on ${booking.createdAt.split('T')[0]} for ${booking.customerName}`}
        badge={<BookingStatusBadge status={booking.status} />}
        breadcrumbs={[
          { label: 'Bookings & Pickups', path: '/admin/bookings' },
          { label: booking.referenceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {booking.status === 'Pending' && (
              <Button
                size="sm"
                onClick={() => handleStatusTransition('Confirmed', 'Confirmed by manager')}
              >
                Confirm Booking
              </Button>
            )}

            {booking.status === 'Confirmed' && isAppointment && (
              <Button
                size="sm"
                onClick={() => handleStatusTransition('Arrived', 'Patient reported at reception')}
              >
                Mark Patient Arrived
              </Button>
            )}

            {booking.status === 'Arrived' && isAppointment && (
              <Button
                size="sm"
                onClick={() => handleStatusTransition('Completed', 'Refraction exam concluded')}
              >
                Complete Consultation
              </Button>
            )}

            {booking.status === 'Confirmed' && !isAppointment && (
              <Button
                size="sm"
                onClick={() => handleStatusTransition('Preparing', 'Packaging frame in bay')}
              >
                Start Packaging
              </Button>
            )}

            {booking.status === 'Preparing' && (
              <Button
                size="sm"
                onClick={() => handleStatusTransition('Ready for pickup', 'Packaged & tagged for collection')}
              >
                Mark Ready for Pickup
              </Button>
            )}

            {booking.status === 'Ready for pickup' && (
              <Button
                size="sm"
                onClick={() => handleStatusTransition('Collected', 'Handed over to customer')}
              >
                Mark Collected
              </Button>
            )}

            {isAppointment && !['Completed', 'Cancelled'].includes(booking.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewDate(booking.appointmentDate || '');
                  setIsRescheduleOpen(true);
                }}
              >
                Reschedule
              </Button>
            )}

            {!['Cancelled', 'Completed', 'Collected', 'Expired'].includes(booking.status) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleStatusTransition('Cancelled', 'Cancelled per customer instruction')}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Details Card (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Booking Particulars
            </h3>
            <span className="font-mono text-xs text-neutral-400">ID: {booking.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-neutral-500 block uppercase font-mono">Customer</span>
              <span className="font-semibold text-neutral-900 text-sm">{booking.customerName}</span>
              <span className="text-neutral-600 font-mono block mt-0.5">{booking.customerPhone}</span>
              {booking.customerEmail && <span className="text-neutral-500 block">{booking.customerEmail}</span>}
              {booking.customerId && (
                <Link
                  to={`/admin/customers/${booking.customerId}`}
                  className="inline-block mt-1 font-semibold text-neutral-900 hover:underline"
                >
                  View Customer Record →
                </Link>
              )}
            </div>

            <div>
              {isAppointment ? (
                <>
                  <span className="text-[11px] text-neutral-500 block uppercase font-mono">Clinical Details</span>
                  <span className="font-semibold text-neutral-900 text-sm block">
                    {booking.appointmentPurpose}
                  </span>
                  <span className="text-neutral-700 block font-mono">{booking.appointmentDate} · {booking.timeSlot}</span>
                  {booking.assignedOptometrist && (
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      Doctor: {booking.assignedOptometrist}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[11px] text-neutral-500 block uppercase font-mono">Pickup Window</span>
                  <span className="font-semibold text-neutral-900 text-sm block">
                    Target: {booking.pickupWindowStart?.split('T')[0]}
                  </span>
                  <span className="text-neutral-600 text-[11px]">
                    Automatic Hold Expiry: {booking.pickupWindowEnd?.split('T')[0]}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Reserved items list */}
          {!isAppointment && booking.reservedItems && booking.reservedItems.length > 0 && (
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                Held Eyewear Inventory
              </span>
              <div className="space-y-2">
                {booking.reservedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block">{item.productName}</span>
                      <span className="text-neutral-500 text-[11px]">
                        {item.colorName} · {item.size} · SKU: {item.variantSku}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-neutral-900 block">
                        {formatINR(item.unitPrice)}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="pt-3 border-t border-neutral-100 text-xs">
              <span className="font-semibold text-neutral-700">Internal & Customer Notes:</span>
              <p className="text-neutral-600 mt-1 italic">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Timeline Log (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Lifecycle Timeline
          </h3>
          <BookingTimeline timeline={booking.timeline} />
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                await handleStatusTransition(booking.status, `Rescheduled to ${newDate} (${newSlot})`);
                setIsRescheduleOpen(false);
              }}
            >
              Update Slot
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-left">
          <DatePicker
            label="New Date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">New Time Slot</label>
            <Select
              options={timeSlotOptions}
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
