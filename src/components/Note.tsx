type NoteProps = {
  text?: string | null
}

export function Note({ text }: NoteProps) {
  const trimmed = (text ?? '').trim()

  return (
    <div className="note">
      <h3 className="note-title">Notatka</h3>
      <div className="note-body">
        {trimmed.length > 0 ? trimmed : 'Brak notatek'}
      </div>
    </div>
  )
}
