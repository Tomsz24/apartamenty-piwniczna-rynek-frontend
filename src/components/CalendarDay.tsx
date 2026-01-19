import type {DayStatus, DayType} from '../types/booking';
import {format, startOfDay} from 'date-fns';

interface CalendarDayProps {
  dayStatus: DayStatus
  isCurrentMonth: boolean

  isAdmin?: boolean
  isSelected?: boolean
  onClick?: () => void
  isDisabled?: boolean
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
      return `${dateStr}\nWymeldowanie i zameldowanie`;
    case 'checkin':
      return `${dateStr}\n✅ Zameldowanie gości`;
    case 'checkout':
      return `${dateStr}\n🚪 Wymeldowanie gości`;
    case 'occupied':
      return `${dateStr}\n⛔ Zajęty`;
    default:
      return `${dateStr}\n✅ Dostępny`;
  }
}

export function CalendarDay({
                              dayStatus,
                              isCurrentMonth,
                              isAdmin = false,
                              isSelected = false,
                              onClick,
                            }: CalendarDayProps) {
  const dayType = getDayType(dayStatus);
  const baseClassName = getDayClassName(dayType, isCurrentMonth);
  const tooltip = getTooltipText(dayStatus);

  const isPast = () => {
    const todayStart = startOfDay(new Date());
    const dayStart = startOfDay(dayStatus.date);
    return dayStart < todayStart;
  }

  const clickable = Boolean(onClick && !isPast());

  return (
    <div
      className={[
        baseClassName,
        isSelected ? 'selected' : '',
        isAdmin  ? 'admin-clickable' : '',
        isPast() ? 'day-disabled' : '',
      ].filter(Boolean).join(' ')}
      onClick={isPast() ? undefined : onClick}
      title={tooltip}
      aria-disabled={isPast() ? true : undefined}
      role={isAdmin ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <span className="day-number">{format(dayStatus.date, 'd')}</span>

      {dayType === 'checkout-checkin' && (
        <div className="day-indicator">
          <span className="indicator-checkout">🚪</span>
          <span className="indicator-checkin">✅</span>
        </div>
      )}

      {dayType === 'checkin' && <span className="day-icon">✅</span>}
      {dayType === 'checkout' && <span className="day-icon">🚪</span>}
    </div>
  );
}
