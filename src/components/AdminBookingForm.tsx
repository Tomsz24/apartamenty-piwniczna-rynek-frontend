import type { Booking } from '../types/booking'

type ApartmentOption = { key: string; name: string }
type Mode = 'create' | 'edit'

interface AdminBookingFormProps {
  apartments: ApartmentOption[]
  selectedApartmentKey: string
  mode: Mode
  selectedBooking: Booking | null

  startDate: string
  endDate: string
  note: string

  validationError?: string | null

  onChangeApartmentKey: (key: string) => void
  onChangeStartDate: (value: string) => void
  onChangeEndDate: (value: string) => void
  onChangeNote: (value: string) => void

  onCancelSelection: () => void

  createBooking: (input: {
    apartmentKey: string
    startDate: string
    endDate: string
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

  upsertExternalNote: (input: { apartmentKey: string; externalId: string; note: string }) => Promise<void>
  deleteExternalNote: (input: { apartmentKey: string; externalId: string }) => Promise<void>
}

export function AdminBookingForm({
                                   apartments,
                                   selectedApartmentKey,
                                   mode,
                                   selectedBooking,
                                   startDate,
                                   endDate,
                                   note,
                                   validationError = null,
                                   onChangeApartmentKey,
                                   onChangeStartDate,
                                   onChangeEndDate,
                                   onChangeNote,
                                   onCancelSelection,
                                   createBooking,
                                   updateBooking,
                                   deleteBooking,
                                   upsertExternalNote,
                                   deleteExternalNote,
                                 }: AdminBookingFormProps) {
  const title = mode === 'edit' ? 'Edycja rezerwacji' : 'Dodaj rezerwację'
  const canSave = Boolean(selectedApartmentKey && startDate && endDate && !validationError)
  const isEditingExternal = mode === 'edit' && selectedBooking?.source === 'external'

  const handleSave = async () => {
    if (mode === 'edit' && selectedBooking && isEditingExternal) {
      await upsertExternalNote({
        apartmentKey: selectedApartmentKey,
        externalId: selectedBooking.externalId || '',
        note: note.trim(),
      })
      return
    }

    if (!canSave) return

    if (mode === 'edit' && selectedBooking) {
      await updateBooking({
        bookingId: selectedBooking.id,
        apartmentKey: selectedApartmentKey,
        startDate,
        endDate,
        note: note.trim() || undefined,
      })
    } else {
      await createBooking({
        apartmentKey: selectedApartmentKey,
        startDate,
        endDate,
        note: note.trim() || undefined,
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedBooking) return

    if (selectedBooking.source === 'external') {
      await deleteExternalNote({
        apartmentKey: selectedApartmentKey,
        externalId: selectedBooking.id,
      })
      return
    }

    await deleteBooking(selectedBooking.id)
  }

  return (
    <aside className="admin-form">
      <h2 className="admin-form-title">{title}</h2>

      <label className="field">
        <span>Apartament</span>
        <select
          value={selectedApartmentKey}
          onChange={(e) => onChangeApartmentKey(e.target.value)}
          disabled={mode === 'edit'}
          title={mode === 'edit' ? 'Nie można zmienić apartamentu w edycji tej rezerwacji' : undefined}
        >
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
          <input
            type="date"
            value={startDate}
            disabled={isEditingExternal}
            onChange={(e) => onChangeStartDate(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Data do</span>
          <input
            type="date"
            value={endDate}
            disabled={isEditingExternal}
            onChange={(e) => onChangeEndDate(e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Notatka</span>
        <textarea value={note} onChange={(e) => onChangeNote(e.target.value)} rows={4} />
      </label>

      {validationError && <div className="error-message">{validationError}</div>}

      <div className="admin-form-actions">
        <button onClick={onCancelSelection}>Anuluj zaznaczenie</button>

        {mode === 'edit' && selectedBooking && (
          <button className="danger" onClick={handleDelete}>
            {selectedBooking.source === 'external' ? 'Usuń notatkę' : 'Usuń'}
          </button>
        )}

        <button
          className="primary"
          onClick={handleSave}
          disabled={isEditingExternal ? note.trim().length === 0 : !canSave}
          title={!canSave ? 'Popraw dane' : undefined}
        >
          {mode === 'edit' ? 'Zapisz zmiany' : 'Dodaj rezerwację'}
        </button>
      </div>
    </aside>
  )
}
