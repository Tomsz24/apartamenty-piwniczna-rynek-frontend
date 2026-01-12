import { Calendar } from './components/Calendar';
import './App.css';

function App() {
  const apartment1Token = import.meta.env.VITE_APARTMENT_1_ICAL_TOKEN || '';
  const apartment2Token = import.meta.env.VITE_APARTMENT_2_ICAL_TOKEN || '';

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 Kalendarz Rezerwacji Apartamentów Piwniczna Rynek</h1>
      </header>

      <main className="calendars-container">
        <Calendar
          title="Apartament z widokiem na góry"
          icalToken={apartment1Token}
        />
        <Calendar
          title="Apartament z widokiem na rynek"
          icalToken={apartment2Token}
        />
      </main>

      <footer className="app-footer">
        <p>Dane pobierane z Booking.com</p>
      </footer>
    </div>
  );
}

export default App;
