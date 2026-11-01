import type { GuestCounts } from '../types/booking'
import { getTotalGuests } from '../lib/guests'

type GuestInfoProps = {
  guests?: GuestCounts | null
}

export function GuestInfo({ guests }: GuestInfoProps) {
  const total = getTotalGuests(guests ?? undefined)

  return (
    <div className="note">
      <h3 className="note-title">Liczba osób</h3>
      <div className="note-body">
        {!guests && 'Zaznacz rezerwację w kalendarzu'}
        {guests && (total ?? 'Brak danych')}
      </div>
    </div>
  )
}
