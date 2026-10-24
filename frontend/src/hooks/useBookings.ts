import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus, BookingType, CreateAppointmentInput, CreateReservationInput } from '../types/booking.types';
import { mockBookingService } from '../services/mockBookingService';
import { mockStore } from '../services/mockApiClient';

export function useBookings(params?: {
  type?: BookingType | 'all';
  status?: BookingStatus | 'all';
  search?: string;
  date?: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockBookingService.list(params);
      setBookings(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchBookings();
    const unsubscribe = mockStore.subscribe(() => {
      fetchBookings();
    });
    return unsubscribe;
  }, [fetchBookings]);

  const createAppointment = async (input: CreateAppointmentInput) => {
    return await mockBookingService.createAppointment(input);
  };

  const createReservation = async (input: CreateReservationInput) => {
    return await mockBookingService.createReservation(input);
  };

  const updateStatus = async (id: string, newStatus: BookingStatus, note?: string, actor?: string) => {
    return await mockBookingService.updateStatus(id, newStatus, note, actor);
  };

  const reschedule = async (id: string, newDate: string, newTimeSlot: string, actor?: string) => {
    return await mockBookingService.reschedule(id, newDate, newTimeSlot, actor);
  };

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createAppointment,
    createReservation,
    updateStatus,
    reschedule,
  };
}

export function useBooking(idOrRef: string, isRef = false) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!idOrRef) return;
    try {
      setLoading(true);
      setError(null);
      const b = isRef
        ? await mockBookingService.getByReference(idOrRef)
        : await mockBookingService.getById(idOrRef);
      setBooking(b);
    } catch (err: any) {
      setError(err?.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  }, [idOrRef, isRef]);

  useEffect(() => {
    fetchBooking();
    const unsubscribe = mockStore.subscribe(() => {
      fetchBooking();
    });
    return unsubscribe;
  }, [fetchBooking]);

  const updateStatus = async (newStatus: BookingStatus, note?: string, actor?: string) => {
    if (!booking) return;
    const res = await mockBookingService.updateStatus(booking.id, newStatus, note, actor);
    await fetchBooking();
    return res;
  };

  return { booking, loading, error, refresh: fetchBooking, updateStatus };
}
