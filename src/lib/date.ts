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

// Week of month: 1-indexed, based on day of month (1-7 => 1, 8-14 => 2, ...).
export function weekOfMonth(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

// Returns week ranges within a month: [{ week: 1, start, end }, ...]
export function weeksInMonth(year: number, month: number): {
  week: number;
  start: Date;
  end: Date;
}[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const weeks: { week: number; start: Date; end: Date }[] = [];
  let weekNum = 1;
  let cursor = new Date(first);
  while (cursor <= last) {
    const start = new Date(cursor);
    const endDay = Math.min(weekNum * 7, last.getDate());
    const end = new Date(year, month - 1, endDay);
    weeks.push({ week: weekNum, start, end });
    cursor = new Date(year, month - 1, endDay + 1);
    weekNum++;
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
