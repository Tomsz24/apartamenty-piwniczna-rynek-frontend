import { useState } from 'react';
import { CalendarDay } from './CalendarDay';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfDay,
  isWithinInterval,
} from 'date-fns';
import { pl } from 'date-fns/locale';
import type { DayStatus } from '../types/booking';

interface SelectedRange {
  start: Date;
  end: Date;
}

interface CalendarProps {
  title: string;
  apartmentKey: string;
  getDayStatuses: (apartmentKey: string, year: number, month: number) => DayStatus[];
  refetch: () => void;
  loading: boolean;

  isAdmin?: boolean;
  selectedRange?: SelectedRange | null;
  onDayClick?: (apartmentKey: string, dayStatus: DayStatus) => void;
}

const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

export function Calendar({
                           title,
                           apartmentKey,
                           getDayStatuses,
                           refetch,
                           loading,
                           isAdmin = false,
                           selectedRange = null,
                           onDayClick,
                         }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dayStatuses = getDayStatuses(apartmentKey, year, month);

  const monthStart = startOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(dayStatuses[dayStatuses.length - 1]?.date || monthStart, { weekStartsOn: 1 });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDayStatusForDate = (date: Date): DayStatus => {
    const found = dayStatuses.find(
      (ds) => ds.date.toDateString() === date.toDateString()
    );
    return found || {
      date,
      isCheckIn: false,
      isCheckOut: false,
      isOccupied: false,
      bookings: [],
    };
  };

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedRange) return false;
    const d = startOfDay(date);
    const s = startOfDay(selectedRange.start);
    const e = startOfDay(selectedRange.end);
    return isWithinInterval(d, { start: s, end: e });
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>{title}</h2>
        <div className="calendar-nav">
          <button onClick={goToPreviousMonth} aria-label="Poprzedni miesiąc">
            ◀
          </button>
          <span className="current-month">
            {format(currentDate, 'LLLL yyyy', { locale: pl })}
          </span>
          <button onClick={goToNextMonth} aria-label="Następny miesiąc">
            ▶
          </button>
        </div>
        <div className="calendar-actions">
          <button onClick={goToToday} className="today-btn">
            Dziś
          </button>
          <button onClick={refetch} className="refresh-btn" disabled={loading}>
            Odśwież
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="days">
          {allDays.map((date) => {
            const dayStatus = getDayStatusForDate(date);

            return (
              <CalendarDay
                key={date.toISOString()}
                dayStatus={dayStatus}
                isCurrentMonth={date.getMonth() === month}
                isAdmin={isAdmin}
                isSelected={isDateInSelectedRange(date)}
                onClick={
                  onDayClick
                    ? () => onDayClick(apartmentKey, dayStatus)
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color free"></span>
          <span>Dostępny</span>
        </div>
        <div className="legend-item">
          <span className="legend-color occupied"></span>
          <span>Zajęty</span>
        </div>
        <div className="legend-item">
          <span className="legend-color checkin"></span>
          <span>Zameldowanie ✅</span>
        </div>
        <div className="legend-item">
          <span className="legend-color checkout"></span>
          <span>Wymeldowanie 🚪</span>
        </div>
        <div className="legend-item">
          <span className="legend-color checkout-checkin"></span>
          <span>Wymeldowanie + Zameldowanie</span>
        </div>
      </div>
    </div>
  );
}
