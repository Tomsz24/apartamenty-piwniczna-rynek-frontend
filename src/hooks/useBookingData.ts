import { useState, useEffect, useCallback } from 'react';
import type {Booking, DayStatus} from '../types/booking';
import { parseICalData } from '../utils/icalParser';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  startOfDay
} from 'date-fns';

export function useBookingData(icalUrl: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!icalUrl) {
      setError('Brak URL do kalendarza iCal');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Używamy proxy CORS lub bezpośredniego dostępu jeśli serwer na to pozwala
      const response = await fetch(icalUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const icalData = await response.text();
      const parsedBookings = parseICalData(icalData);
      setBookings(parsedBookings);
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
      setError('Nie udało się pobrać danych rezerwacji. Sprawdź URL i połączenie.');
    } finally {
      setLoading(false);
    }
  }, [icalUrl]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getDayStatuses = useCallback((year: number, month: number): DayStatus[] => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((date) => {
      const dayStart = startOfDay(date);

      const dayBookings = bookings.filter((booking) => {
        const bookingStart = startOfDay(booking.startDate);
        const bookingEnd = startOfDay(booking.endDate);

        return isWithinInterval(dayStart, { start: bookingStart, end: bookingEnd }) ||
          isSameDay(dayStart, bookingStart) ||
          isSameDay(dayStart, bookingEnd);
      });

      const isCheckIn = bookings.some((booking) =>
        isSameDay(dayStart, startOfDay(booking.startDate))
      );

      const isCheckOut = bookings.some((booking) =>
        isSameDay(dayStart, startOfDay(booking.endDate))
      );

      const isOccupied = bookings.some((booking) => {
        const bookingStart = startOfDay(booking.startDate);
        const bookingEnd = startOfDay(booking.endDate);
        return dayStart > bookingStart && dayStart < bookingEnd;
      });

      return {
        date,
        isCheckIn,
        isCheckOut,
        isOccupied,
        bookings: dayBookings,
      };
    });
  }, [bookings]);

  return { bookings, loading, error, getDayStatuses, refetch: fetchBookings };
}
