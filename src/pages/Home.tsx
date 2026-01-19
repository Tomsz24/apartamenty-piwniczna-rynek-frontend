import { useMemo, useState } from 'react'
import { useBookingData } from '../hooks/useBookingData'
import { Calendar } from '../components/Calendar'
import type { DayStatus } from '../types/booking'
import { Note } from '../components/Note'

type SelectedRange = { start: Date; end: Date }

export function Home() {
  const { apartments, loading, error, getDayStatuses, refetch } = useBookingData()
  const apartmentKeys = Object.keys(apartments)

  const [selectedApartmentKey, setSelectedApartmentKey] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null)
  const [noteText, setNoteText] = useState<string | null>(null)

  const handleDayClick = (apartmentKey: string, dayStatus: DayStatus) => {
    setSelectedApartmentKey(apartmentKey)

    const booking = dayStatus.bookings[0] ?? null
    if (!booking) {
      setSelectedRange(null)
      setNoteText(null)
      return
    }

    setSelectedRange({ start: booking.startDate, end: booking.endDate })
    setNoteText(booking.note ?? null)
  }

  useMemo(() => {
    if (!selectedApartmentKey && apartmentKeys[0]) {
      setSelectedApartmentKey(apartmentKeys[0])
    }
  }, [apartmentKeys, selectedApartmentKey])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Apartamenty Piwniczna Rynek – dostępność</h1>
      </header>

      {loading && <div className="loading">Ładowanie rezerwacji...</div>}
      {error && <div className="error">{error}</div>}

      <main className="calendars-container">
        {apartmentKeys.map((key) => (
          <Calendar
            key={apartments[key].apartmentId}
            title={apartments[key].apartmentName}
            apartmentKey={key}
            getDayStatuses={getDayStatuses}
            refetch={refetch}
            loading={loading}
            selectedRange={selectedApartmentKey === key ? selectedRange : null}
            onDayClick={handleDayClick}
          />
        ))}
      </main>

      <div style={{ width: '100%', maxWidth: 1400, marginTop: 16 }}>
        <Note text={noteText} />
      </div>
    </div>
  )
}
