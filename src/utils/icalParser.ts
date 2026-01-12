import ICAL from 'ical.js';
import type {Booking} from '../types/booking';

export function parseICalData(icalData: string): Booking[] {
  const bookings: Booking[] = [];

  try {
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent');

    events.forEach((event) => {
      const vevent = new ICAL.Event(event);

      const booking: Booking = {
        id: vevent.uid || crypto.randomUUID(),
        summary: vevent.summary || 'Rezerwacja',
        startDate: vevent.startDate.toJSDate(),
        endDate: vevent.endDate.toJSDate(),
        guestName: extractGuestName(vevent.summary || ''),
      };

      bookings.push(booking);
    });
  } catch (error) {
    console.error('Błąd parsowania iCal:', error);
  }

  return bookings;
}

function extractGuestName(summary: string): string {
  // Booking.com często używa formatu "CLOSED - Imię Nazwisko"
  const match = summary.match(/CLOSED\s*-\s*(.+)/i);
  return match ? match[1].trim() : summary;
}
