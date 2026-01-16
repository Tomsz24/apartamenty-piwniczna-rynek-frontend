import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import type { Booking } from '../../types/booking'

type ApartmentOption = { key: string; name: string }

type Mode = 'create' | 'edit'

interface BookingModalProps {
  open: boolean
  onClose: () => void
  onAfterSave: () => void

  apartments: ApartmentOption[]
  initialApartmentKey: string

  mode: Mode
  selectedBooking: Booking | null

  createBooking: (input: {
    apartmentKey: string
    startDate: string // yyyy-MM-dd
    endDate: string   // yyyy-MM-dd
    note?: string
  }) => Promise<void>

  updateBooking: (input: {
    bookingId: string
    apartmentKey: string
    startDate: string
    endDate: string
    note?: string
  }) => Promise<void>

  deleteBooking: (bookingId: string) => Promise<void>
}

export function BookingModal({
                               open,
                               onClose,
                               onAfterSave,
                               apartments,
                               initialApartmentKey,
                               mode,
                               selectedBooking,
                               createBooking,
                               updateBooking,
                               deleteBooking,
                             }: BookingModalProps) {
  const [apartmentKey, setApartmentKey] = useState(initialApartmentKey)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => (mode === 'edit' ? 'Modyfikuj rezerwację' : 'Dodaj rezerwację'), [mode])

  useEffect(() => {
    if (!open) return

    setApartmentKey(initialApartmentKey)
    setError(null)

    if (mode === 'edit' && selectedBooking) {
      setStartDate(format(selectedBooking.startDate, 'yyyy-MM-dd'))
      setEndDate(format(selectedBooking.endDate, 'yyyy-MM-dd'))
      setNote(selectedBooking.note ?? '')
    } else {
      const today = format(new Date(), 'yyyy-MM-dd')
      setStartDate(today)
      setEndDate(today)
      setNote('')
    }
  }, [open, mode, selectedBooking, initialApartmentKey])

  if (!open) return null

  const handleSave = async () => {
    setBusy(true)
    setError(null)

    try {
      if (!startDate || !endDate) {
        setError('Uzupełnij daty.')
        return
      }

      if (mode === 'edit' && selectedBooking) {
        await updateBooking({
          bookingId: selectedBooking.id,
          apartmentKey,
          startDate,
          endDate,
          note: note.trim() || undefined,
        })
      } else {
        await createBooking({
          apartmentKey,
          startDate,
          endDate,
          note: note.trim() || undefined,
        })
      }

      onAfterSave()
      onClose()
    } catch (e) {
      setError('Nie udało się zapisać rezerwacji (sprawdź backend/endpointy).')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBooking) return
    setBusy(true)
    setError(null)

    try {
      await deleteBooking(selectedBooking.id)
      onAfterSave()
      onClose()
    } catch (e) {
      setError('Nie udało się usunąć rezerwacji (sprawdź backend/endpointy).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Zamknij">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span>Apartament</span>
            <select value={apartmentKey} onChange={(e) => setApartmentKey(e.target.value)} disabled={busy}>
              {apartments.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <div className="row">
            <label className="field">
              <span>Data od</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={busy} />
            </label>

            <label className="field">
              <span>Data do</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={busy} />
            </label>
          </div>

          <label className="field">
            <span>Notatka (opcjonalnie)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} rows={3} />
          </label>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={busy}>
            Anuluj
          </button>

          {mode === 'edit' && selectedBooking && (
            <button className="danger" onClick={handleDelete} disabled={busy}>
              Usuń rezerwację
            </button>
          )}

          <button className="primary" onClick={handleSave} disabled={busy}>
            {mode === 'edit' ? 'Zapisz zmiany' : 'Dodaj rezerwację'}
          </button>
        </div>
      </div>
    </div>
  )
}
