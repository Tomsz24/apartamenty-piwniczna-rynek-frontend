
import { useState, useEffect, useCallback } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
  isWithinInterval,
  isSameDay,
} from 'date-fns';
import type { Booking, BookingFromApi, CalendarsResponse, DayStatus } from '../types/booking';

interface ApartmentBookings {
  apartmentId: string;
  apartmentName: string;
  bookings: Booking[];
}

interface UseBookingDataOptions {
  accessToken?: string | null;
}

interface UseBookingDataResult {
  apartments: Record<string, ApartmentBookings>;
  loading: boolean;
  error: string | null;
  getDayStatuses: (apartmentKey: string, year: number, month: number) => DayStatus[];
  refetch: () => void;
}

function parseBookings(apiBookings: BookingFromApi[]): Booking[] {
  return apiBookings.map((booking) => ({
    id: booking.id,
    startDate: new Date(booking.startDate),
    endDate: new Date(booking.endDate),
    source: booking.source,
    note: booking.note,
    externalId: booking.externalId,
  }));
}

export function useBookingData(options: UseBookingDataOptions = {}): UseBookingDataResult {
  const { accessToken } = options;
  const [apartments, setApartments] = useState<Record<string, ApartmentBookings>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/calendars`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CalendarsResponse = await response.json();

      const parsedApartments: Record<string, ApartmentBookings> = {};

      for (const [key, apartmentData] of Object.entries(data)) {
        parsedApartments[key] = {
          apartmentId: apartmentData.apartmentId,
          apartmentName: apartmentData.apartmentName,
          bookings: parseBookings(apartmentData.bookings),
        };
      }

      setApartments(parsedApartments);
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
      setError('Nie udało się pobrać danych rezerwacji. Sprawdź połączenie z serwerem.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getDayStatuses = useCallback((apartmentKey: string, year: number, month: number): DayStatus[] => {
    const apartmentBookings = apartments[apartmentKey]?.bookings || [];

    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((date) => {
      const dayStart = startOfDay(date);

      const dayBookings = apartmentBookings.filter((booking) => {
        const bookingStart = startOfDay(booking.startDate);
        const bookingEnd = startOfDay(booking.endDate);

        return isWithinInterval(dayStart, { start: bookingStart, end: bookingEnd }) ||
          isSameDay(dayStart, bookingStart) ||
          isSameDay(dayStart, bookingEnd);
      });

      const isCheckIn = apartmentBookings.some((booking) =>
        isSameDay(dayStart, startOfDay(booking.startDate))
      );

      const isCheckOut = apartmentBookings.some((booking) =>
        isSameDay(dayStart, startOfDay(booking.endDate))
      );

      const isOccupied = apartmentBookings.some((booking) => {
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
  }, [apartments]);

  return { apartments, loading, error, getDayStatuses, refetch: fetchBookings };
}
