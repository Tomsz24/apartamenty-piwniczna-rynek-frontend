
export interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  source: 'manual' | 'external';
  note?: string;
}

export interface BookingFromApi {
  id: string;
  startDate: string;
  endDate: string;
  source: 'manual' | 'external';
  note?: string;
}

export interface ApartmentData {
  apartmentId: string;
  apartmentName: string;
  bookings: BookingFromApi[];
}

export interface CalendarsResponse {
  [key: string]: ApartmentData;
}

export interface DayStatus {
  date: Date;
  isCheckIn: boolean;
  isCheckOut: boolean;
  isOccupied: boolean;
  bookings: Booking[];
}

export type DayType = 'free' | 'occupied' | 'checkout' | 'checkin' | 'checkout-checkin';
