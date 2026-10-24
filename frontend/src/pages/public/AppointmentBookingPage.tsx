import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingForm } from '../../components/bookings/BookingForm';
import { useBookings } from '../../hooks/useBookings';
import { CreateAppointmentInput } from '../../types/booking.types';
import { Calendar, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const AppointmentBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAppointment } = useBookings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookingSubmit = async (input: CreateAppointmentInput) => {
    setIsSubmitting(true);
    try {
      const result = await createAppointment(input);
      navigate(`/booking/confirmation/${result.referenceNumber}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Clinical Scheduling
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">
          Schedule Clinical Eye Examination
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Complimentary 14-point refractive vision test with computerized digital phoropter and certified optometrist consultation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
          <BookingForm onSubmit={handleBookingSubmit} isLoading={isSubmitting} />
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900">What to Expect</h4>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <span>Zero obligation, fully complimentary 45-minute clinical slot.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <span>Instant SMS confirmation and appointment calendar invite.</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <span>Bandra West Flagship, Turner Road. Valet parking provided.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-neutral-900 text-neutral-300 rounded-xl text-xs space-y-1">
            <span className="text-white font-bold block">Need Urgent Frame Repair?</span>
            <p className="text-[11px] text-neutral-400">
              Walk straight into our repair bay anytime between 10 AM and 8 PM for same-day nosepad and screw tightening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
