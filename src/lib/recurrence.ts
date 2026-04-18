import type { Task } from './db';
import { fromISODate, isWithinRange } from './date';

// Determine whether a task is "active" for a given date range.
// Rules:
// - If recurrence is 'none', the task is active only when its period overlaps the range.
// - If recurrence is 'daily' | 'weekly' | 'monthly', the task repeats and stays active
//   from its periodStart onwards (periodEnd acts as a hard end cap if set in future/past).
// This determines if the task SHOULD appear in a given view's range.
export function isTaskActiveInRange(
  task: Task,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const start = fromISODate(task.periodStart);
  const end = fromISODate(task.periodEnd);

  if (task.recurrence === 'none') {
    // overlap check
    return !(end < rangeStart || start > rangeEnd);
  }

  // Recurring tasks: active as long as range intersects [start, end]
  return !(end < rangeStart || start > rangeEnd);
}

export function isTaskActiveOn(task: Task, day: Date): boolean {
  const start = fromISODate(task.periodStart);
  const end = fromISODate(task.periodEnd);
  if (!isWithinRange(day, start, end)) return false;
  return true;
}
