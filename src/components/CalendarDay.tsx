import type {DayStatus, DayType} from '../types/booking';
import { format } from 'date-fns';

interface CalendarDayProps {
  dayStatus: DayStatus;
  isCurrentMonth: boolean;
}

function getDayType(dayStatus: DayStatus): DayType {
  const { isCheckIn, isCheckOut, isOccupied } = dayStatus;

  if (isCheckOut && isCheckIn) {
    return 'checkout-checkin';
  }
  if (isCheckIn) {
    return 'checkin';
  }
  if (isCheckOut) {
    return 'checkout';
  }
  if (isOccupied) {
    return 'occupied';
  }
  return 'free';
}

function getDayClassName(dayType: DayType, isCurrentMonth: boolean): string {
  const baseClass = 'calendar-day';
  const monthClass = isCurrentMonth ? '' : 'other-month';

  const typeClasses: Record<DayType, string> = {
    'free': 'day-free',
    'occupied': 'day-occupied',
    'checkin': 'day-checkin',
    'checkout': 'day-checkout',
    'checkout-checkin': 'day-checkout-checkin',
  };

  return `${baseClass} ${typeClasses[dayType]} ${monthClass}`.trim();
}

function getTooltipText(dayStatus: DayStatus): string {
  const dayType = getDayType(dayStatus);
  const dateStr = format(dayStatus.date, 'dd.MM.yyyy');

  switch (dayType) {
    case 'checkout-checkin':
      return `${dateStr}\n Wymeldowanie i zameldowanie`;
    case 'checkin':
      return `${dateStr}\n✅ Zameldowanie gości`;
    case 'checkout':
      return `${dateStr}\n Wymeldowanie gości`;
    case 'occupied':
      return `${dateStr}\n Zajęty`;
    default:
      return `${dateStr}\n Dostępny`;
  }
}

export function CalendarDay({ dayStatus, isCurrentMonth }: CalendarDayProps) {
  const dayType = getDayType(dayStatus);
  const className = getDayClassName(dayType, isCurrentMonth);
  const tooltip = getTooltipText(dayStatus);

  return (
    <div className={className} title={tooltip}>
      <span className="day-number">{format(dayStatus.date, 'd')}</span>
      {dayType === 'checkout-checkin' && (
        <div className="day-indicator">
          <span className="indicator-checkout"></span>
          <span className="indicator-checkin">✅</span>
        </div>
      )}
      {dayType === 'checkin' && <span className="day-icon">✅</span>}
      {dayType === 'checkout' && <span className="day-icon"></span>}
    </div>
  );
}
