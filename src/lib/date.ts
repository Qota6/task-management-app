// All helpers use local time.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// First day of the week: 0 = Sunday, 1 = Monday. Switch here to change globally.
export const WEEK_START: 0 | 1 = 0;

// How many days the first calendar week of `month` overlaps with the previous month.
function leadingOffset(year: number, month: number): number {
  const first = new Date(year, month - 1, 1);
  return (first.getDay() - WEEK_START + 7) % 7;
}

// Week of month based on the real calendar week containing `d`.
// Week boundaries align to WEEK_START; first/last weeks of the month may be partial.
export function weekOfMonth(d: Date): number {
  const offset = leadingOffset(d.getFullYear(), d.getMonth() + 1);
  return Math.floor((d.getDate() - 1 + offset) / 7) + 1;
}

// Returns week ranges within a month, clamped to month boundaries.
export function weeksInMonth(year: number, month: number): {
  week: number;
  start: Date;
  end: Date;
}[] {
  const offset = leadingOffset(year, month);
  const totalDays = new Date(year, month, 0).getDate();
  const totalWeeks = Math.ceil((totalDays + offset) / 7);

  const weeks: { week: number; start: Date; end: Date }[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const startDay = Math.max(1, (w - 1) * 7 - offset + 1);
    const endDay = Math.min(totalDays, w * 7 - offset);
    weeks.push({
      week: w,
      start: new Date(year, month - 1, startDay),
      end: new Date(year, month - 1, endDay),
    });
  }
  return weeks;
}

export function isWithinRange(target: Date, start: Date, end: Date): boolean {
  const t = target.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function formatDateJP(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function formatDateTimeJP(d: Date): string {
  return `${formatDateJP(d)} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

export function formatShortRange(start: Date, end: Date): string {
  const s = `${start.getMonth() + 1}/${start.getDate()}`;
  const e = `${end.getMonth() + 1}/${end.getDate()}`;
  return `${s}〜${e}`;
}

export function monthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function todayISO(): string {
  return toISODate(new Date());
}
