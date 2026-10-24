import React, { useState } from 'react';
import { AppointmentPurpose, CreateAppointmentInput } from '../../types/booking.types';
import { getAvailableTimeSlots, getTodayDateString } from '../../utils/dates';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { DatePicker } from '../common/DatePicker';

export interface BookingFormProps {
  onSubmit: (input: CreateAppointmentInput) => Promise<void>;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, isLoading = false }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [appointmentPurpose, setAppointmentPurpose] = useState<AppointmentPurpose>('Comprehensive Eye Exam');
  const [appointmentDate, setAppointmentDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState(getAvailableTimeSlots()[0]);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const purposes: Array<{ label: string; value: AppointmentPurpose }> = [
    { label: 'Comprehensive Eye Exam (14-Point Digital)', value: 'Comprehensive Eye Exam' },
    { label: 'Contact Lens Consultation & Trial Fitting', value: 'Contact Lens Consultation' },
    { label: 'Frame Styling & Personal Fitting', value: 'Frame Styling & Fitting' },
    { label: 'Prescription Verification & Adjustments', value: 'Prescription Verification' },
    { label: 'Lens Adjustment & Nosepad Repair', value: 'Lens Adjustment & Repair' },
    { label: 'Routine Follow-up Checkup', value: 'Follow-up Checkup' },
  ];

  const timeSlots = getAvailableTimeSlots().map((s) => ({ label: s, value: s }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Please enter your full name';
    }
    if (!isValidPhone(customerPhone)) {
      newErrors.customerPhone = 'Enter a valid 10-digit mobile number';
    }
    if (customerEmail && !isValidEmail(customerEmail)) {
      newErrors.customerEmail = 'Enter a valid email address';
    }
    if (!appointmentDate) {
      newErrors.appointmentDate = 'Select an appointment date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || undefined,
      appointmentPurpose,
      appointmentDate,
      timeSlot,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">
          Select Appointment Purpose
        </label>
        <Select
          options={purposes}
          value={appointmentPurpose}
          onChange={(e) => setAppointmentPurpose(e.target.value as AppointmentPurpose)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicker
          label="Preferred Date"
          value={appointmentDate}
          min={getTodayDateString()}
          onChange={(e) => setAppointmentDate(e.target.value)}
          error={errors.appointmentDate}
        />
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Available Time Slot
          </label>
          <Select
            options={timeSlots}
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          />
        </div>
      </div>

      <Input
        label="Full Name"
        placeholder="e.g. Priya Sharma"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        error={errors.customerName}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Mobile Phone Number"
          placeholder="10-digit number"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          error={errors.customerPhone}
          helperText="We will send your confirmation code via SMS & WhatsApp"
        />
        <Input
          label="Email Address (Optional)"
          placeholder="name@example.com"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          error={errors.customerEmail}
          helperText="For calendar invite & digital receipts"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">
          Notes or Symptoms (Optional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Experiencing headaches during laptop work, current power -2.50"
          className="w-full rounded-md border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Confirm Clinical Appointment
        </Button>
      </div>
    </form>
  );
};
