import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../../hooks/useBookings';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { BookingStatusBadge } from '../../components/bookings/BookingStatusBadge';
import { BookingTimeline } from '../../components/bookings/BookingTimeline';
import { formatDateTime } from '../../utils/dates';
import { formatINR } from '../../utils/currency';
import { CheckCircle, Calendar, Store, ArrowRight, MapPin, Phone } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const BookingConfirmationPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const { booking, loading, error } = useBooking(reference || '', true);

  if (loading) return <LoadingState message="Locating booking records..." />;
  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <ErrorState
          title="Booking not found"
          message={`No booking or reservation matched reference "${reference}". Please check the reference code.`}
        />
      </div>
    );
  }

  const isAppointment = booking.bookingType === 'appointment';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
      {/* Success banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 sm:p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
          {isAppointment ? 'Eye Exam Appointment Scheduled!' : 'Eyewear Reservation Confirmed!'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
          We have generated your confirmation and notified our Bandra clinical staff. Please present your reference number upon arrival.
        </p>
        <div className="inline-block px-4 py-2 bg-white border border-emerald-300 rounded-md shadow-2xs font-mono text-base font-bold text-neutral-900 tracking-wider">
          {booking.referenceNumber}
        </div>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            {isAppointment ? <Calendar className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {isAppointment ? 'Appointment Summary' : 'In-Store Hold Details'}
            </span>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-neutral-500 block uppercase font-mono">Patient / Client</span>
            <span className="font-semibold text-neutral-900 text-sm">{booking.customerName}</span>
            <span className="block text-neutral-600 font-mono mt-0.5">{booking.customerPhone}</span>
            {booking.customerEmail && (
              <span className="block text-neutral-500 text-[11px]">{booking.customerEmail}</span>
            )}
          </div>

          <div>
            {isAppointment ? (
              <>
                <span className="text-[11px] text-neutral-500 block uppercase font-mono">Appointment Slot</span>
                <span className="font-semibold text-neutral-900 text-sm block">
                  {booking.appointmentDate}
                </span>
                <span className="text-neutral-600 font-mono">{booking.timeSlot}</span>
                <span className="block text-[11px] text-neutral-500 mt-1">
                  Purpose: {booking.appointmentPurpose}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-neutral-500 block uppercase font-mono">Hold Expiration</span>
                <span className="font-semibold text-neutral-900 text-sm block">
                  Active for 3 Business Days
                </span>
                <span className="text-neutral-600 text-[11px]">
                  Until: {booking.pickupWindowEnd?.split('T')[0]}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Reserved items if reservation */}
        {!isAppointment && booking.reservedItems && booking.reservedItems.length > 0 && (
          <div className="pt-3 border-t border-neutral-100">
            <span className="text-[11px] text-neutral-500 block uppercase font-mono mb-2">
              Reserved Frames for In-Store Trial
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
                    <span className="text-[10px] text-neutral-500 font-mono">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {booking.notes && (
          <div className="pt-3 border-t border-neutral-100 text-xs">
            <span className="text-neutral-500 font-medium">Customer Notes:</span>
            <p className="text-neutral-700 italic mt-0.5">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
          Status Activity Timeline
        </h3>
        <BookingTimeline timeline={booking.timeline} />
      </div>

      {/* Showroom location box */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
            <MapPin className="w-4 h-4 text-neutral-800" />
            <span>Showroom Location</span>
          </div>
          <p className="text-neutral-600 pl-5">
            401 Turner Road, Bandra West, Mumbai 400050 · Tel: +91 (022) 2640 8899
          </p>
        </div>
        <Link to="/products">
          <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
