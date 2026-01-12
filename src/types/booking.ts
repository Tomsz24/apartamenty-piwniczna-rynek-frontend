export interface Booking {
  id: string;
  summary: string;
  startDate: Date;
  endDate: Date;
  guestName?: string;
}

export interface DayStatus {
  date: Date;
  isCheckIn: boolean;
  isCheckOut: boolean;
  isOccupied: boolean;
  bookings: Booking[];
}

export type DayType = 'free' | 'occupied' | 'checkout' | 'checkin' | 'checkout-checkin';
