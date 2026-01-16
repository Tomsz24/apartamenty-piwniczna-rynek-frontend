import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfDay } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useBookingData } from '../../hooks/useBookingData'
import { Calendar } from '../../components/Calendar'
import type { Booking, DayStatus } from '../../types/booking'
import { AdminBookingForm } from '../../components/AdminBookingForm'

type SelectedRange = { start: Date; end: Date }

function toDateInput(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

function fromDateInput(value: string) {
  return new Date(`${value}T00:00:00`)
}

function overlapsAllowingTouch(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { accessToken } = useAuth()

  const { apartments, loading, error, getDayStatuses, refetch } = useBookingData({
    accessToken,
  })

  const apartmentKeys = Object.keys(apartments)

  const apartmentOptions = useMemo(
    () => apartmentKeys.map((key) => ({ key, name: apartments[key].apartmentName })),
    [apartmentKeys, apartments]
  )

  const today = new Date()

  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [selectedApartmentKey, setSelectedApartmentKey] = useState<string>(apartmentKeys[0] || '')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const [selectedRange, setSelectedRange] = useState<SelectedRange>({
    start: today,
    end: today,
  })

  const [startDate, setStartDate] = useState<string>(toDateInput(today))
  const [endDate, setEndDate] = useState<string>(toDateInput(today))
  const [note, setNote] = useState<string>('')
  const [information, setInformation] = useState<string | null>(null)

  const resetForm = () => {
    const d = new Date()
    setMode('create')
    setSelectedBooking(null)
    setSelectedRange({ start: d, end: d })
    setStartDate(toDateInput(d))
    setEndDate(toDateInput(d))
    setNote('')
  }

  const showInformation = (message: string) => {
    setInformation(message)
    setTimeout(() => setInformation(null), 5000)
  }

  const authFetch = async (input: string, init: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    }
    if (accessToken) { // @ts-ignore
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    return fetch(input, { ...init, headers })
  }

  const createBooking = async (input: { apartmentKey: string; startDate: string; endDate: string; note?: string }) => {
    const apartmentId = apartments[input.apartmentKey]?.apartmentId
    if (!apartmentId) throw new Error('Brak apartmentId dla wybranego apartamentu')

    const res = await authFetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/calendars/bookings`, {
      method: 'POST',
      body: JSON.stringify({
        apartmentId,
        startDate: input.startDate,
        endDate: input.endDate,
        note: input.note ?? undefined,
        createdBy: 'admin',
      }),
    })


    if (!res.ok) {
      showInformation('Wsytąpił Błąd 🛑')
      throw new Error(`HTTP ${res.status}`)
    }

    showInformation('Dodano rezerwację ✅')
    resetForm()
    refetch()
  }
  const updateBooking = async (input: {
    bookingId: string
    apartmentKey: string
    startDate: string
    endDate: string
    note?: string
  }) => {
    const body: Record<string, string> = {}

    if (selectedBooking && selectedBooking.id === input.bookingId) {
      const prevStart = format(selectedBooking.startDate, 'yyyy-MM-dd')
      const prevEnd = format(selectedBooking.endDate, 'yyyy-MM-dd')
      const prevNote = (selectedBooking.note ?? '').trim()
      const nextNote = (input.note ?? '').trim()

      if (input.startDate !== prevStart) body.startDate = input.startDate
      if (input.endDate !== prevEnd) body.endDate = input.endDate
      if (nextNote !== prevNote) body.note = nextNote
    } else {
      body.startDate = input.startDate
      body.endDate = input.endDate
      if (input.note) body.note = input.note
    }

    if (Object.keys(body).length === 0) return

    const res = await authFetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/calendars/bookings/${input.bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })


    if (res.status === 409) {
      showInformation('Wsytąpił Błąd 🛑')
      throw new Error('CONFLICT')
    }
    if (!res.ok) {
      showInformation('Wsytąpił Błąd 🛑')
      throw new Error(`HTTP ${res.status}`)
    }

    showInformation('Zaktualizowano rezerwację ✅')
    resetForm()
    refetch()
  }

  const deleteBooking = async (bookingId: string) => {
    const res = await authFetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/calendars/bookings/${bookingId}`, {
      method: 'DELETE',
    })

    if (!res.ok && res.status !== 204) {
      showInformation('Wsytąpił Błąd 🛑')
      throw new Error(`HTTP ${res.status}`)
    }

    showInformation('Usunieto rezerwację ✅')
    resetForm()
    refetch()
  }

  const resetToToday = () => {
    const d = new Date()
    setMode('create')
    setSelectedBooking(null)
    setSelectedRange({ start: d, end: d })
    setStartDate(toDateInput(d))
    setEndDate(toDateInput(d))
    setNote('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  const syncRangeFromInputs = (nextStart: string, nextEnd: string) => {
    if (!nextStart || !nextEnd) return

    const sRaw = startOfDay(fromDateInput(nextStart))
    const eRaw = startOfDay(fromDateInput(nextEnd))

    const start = sRaw <= eRaw ? sRaw : eRaw
    const end = sRaw <= eRaw ? eRaw : sRaw

    setSelectedRange({ start, end })
  }

  const handleDayClick = (apartmentKey: string, dayStatus: DayStatus) => {
    setSelectedApartmentKey(apartmentKey)

    const booking = dayStatus.bookings[0] ?? null
    if (booking) {
      setMode('edit')
      setSelectedBooking(booking)

      setSelectedRange({ start: booking.startDate, end: booking.endDate })
      setStartDate(toDateInput(booking.startDate))
      setEndDate(toDateInput(booking.endDate))
      setNote(booking.note ?? '')
    } else {
      setMode('create')
      setSelectedBooking(null)

      setSelectedRange({ start: dayStatus.date, end: dayStatus.date })
      setStartDate(toDateInput(dayStatus.date))
      setEndDate(toDateInput(dayStatus.date))
      setNote('')
    }
  }

  const findBookingConflict = () => {
    if (!selectedApartmentKey) return null
    if (!startDate || !endDate) return null

    const sRaw = startOfDay(fromDateInput(startDate))
    const eRaw = startOfDay(fromDateInput(endDate))

    const start = sRaw <= eRaw ? sRaw : eRaw
    const end = sRaw <= eRaw ? eRaw : sRaw

    const bookings = apartments[selectedApartmentKey]?.bookings ?? []
    for (const b of bookings) {
      if (mode === 'edit' && selectedBooking?.id && b.id === selectedBooking.id) continue

      const bStart = startOfDay(b.startDate)
      const bEnd = startOfDay(b.endDate)

      if (overlapsAllowingTouch(start, end, bStart, bEnd)) {
        return b
      }
    }

    return null
  }

  const conflictBooking = findBookingConflict()
  const validationError = conflictBooking
    ? `Kolizja z istniejącą rezerwacją: ${format(conflictBooking.startDate, 'dd.MM.yyyy')} → ${format(
      conflictBooking.endDate,
      'dd.MM.yyyy'
    )}`
    : null

  if (!selectedApartmentKey && apartmentKeys[0]) {
    setSelectedApartmentKey(apartmentKeys[0])
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel Administracyjny</h1>
        <button onClick={handleLogout} className="logout-btn">
          Wyloguj
        </button>
      </header>

      {loading && <div className="loading">Ładowanie rezerwacji...</div>}
      {error && <div className="error">{error}</div>}

      <div className="admin-layout">
        <main className="calendars-container admin-calendars">
          {apartmentKeys.map((key) => (
            <Calendar
              key={apartments[key].apartmentId}
              title={apartments[key].apartmentName}
              apartmentKey={key}
              getDayStatuses={getDayStatuses}
              refetch={refetch}
              loading={loading}
              isAdmin={true}
              selectedRange={selectedApartmentKey === key ? selectedRange : null}
              onDayClick={handleDayClick}
            />
          ))}
        </main>

        <AdminBookingForm
          apartments={apartmentOptions}
          selectedApartmentKey={selectedApartmentKey}
          mode={mode}
          selectedBooking={selectedBooking}
          startDate={startDate}
          endDate={endDate}
          note={note}
          validationError={validationError}
          onChangeApartmentKey={setSelectedApartmentKey}
          onChangeStartDate={(v) => {
            setStartDate(v)
            syncRangeFromInputs(v, endDate)
          }}
          onChangeEndDate={(v) => {
            setEndDate(v)
            syncRangeFromInputs(startDate, v)
          }}
          onChangeNote={setNote}
          onCancelSelection={resetToToday}
          createBooking={createBooking}
          updateBooking={updateBooking}
          deleteBooking={deleteBooking}
        />
      </div>

      {information ? <div className="information-note">{information}</div> : null}
    </div>
  )
}
