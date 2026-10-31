import type { GuestCounts } from '../types/booking'

export function getTotalGuests(guests?: GuestCounts): number | null {
  if (!guests) return null
  if (guests.guestCount) return guests.guestCount
  const sum = (guests.adults ?? 0) + (guests.children ?? 0) + (guests.infants ?? 0)
  return sum > 0 ? sum : null
}
