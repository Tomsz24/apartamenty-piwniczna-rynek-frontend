import { useBookingData } from '../hooks/useBookingData'
import { Calendar } from '../components/Calendar'

export function Home() {
  const { apartments, loading, error, getDayStatuses, refetch } = useBookingData()
  const apartmentKeys = Object.keys(apartments)

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
          />
        ))}
      </main>
    </div>
  )
}
