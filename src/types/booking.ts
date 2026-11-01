
export interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  source?: 'manual' | 'external';
  note?: string;
  externalId?: string;
  guests?: GuestCounts;
}

export interface GuestCounts {
  guestCount?: number | null;
  adults?: number | null;
  children?: number | null;
  childAges?: number[] | null;
  infants?: number | null;
  pets?: number | null;
}

export interface BookingFromApi extends GuestCounts {
  id: string;
  startDate: string;
  endDate: string;
  source?: 'manual' | 'external';
  note?: string | null;
  externalId?: string;
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
