import Dexie, { type EntityTable } from 'dexie';

export type TaskType = 'monthly' | 'weekly';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: number;
  name: string;
  type: TaskType;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  recurrence: Recurrence;
  // For monthly tasks, optional: restrict to specific week-of-month numbers (1..5). Empty/undefined = all weeks.
  targetWeeks?: number[];
  createdAt: string; // ISO datetime
  archivedAt?: string;
}

export interface Completion {
  id: number;
  taskId: number;
  completedAt: string; // ISO datetime
  // For monthly tasks we also store which week of month this belongs to.
  year?: number;
  month?: number; // 1..12
  weekOfMonth?: number; // 1..5
}

class TaskDB extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  completions!: EntityTable<Completion, 'id'>;

  constructor() {
    super('task-planner');
    this.version(1).stores({
      tasks: '++id, type, periodStart, periodEnd, recurrence, archivedAt',
      completions: '++id, taskId, completedAt, [taskId+year+month+weekOfMonth]',
    });
  }
}

export const db = new TaskDB();

export async function exportAllData(): Promise<string> {
  const [tasks, completions] = await Promise.all([
    db.tasks.toArray(),
    db.completions.toArray(),
  ]);
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), tasks, completions },
    null,
    2,
  );
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.completions)) {
    throw new Error('Invalid backup file');
  }
  await db.transaction('rw', db.tasks, db.completions, async () => {
    await db.tasks.clear();
    await db.completions.clear();
    await db.tasks.bulkAdd(data.tasks);
    await db.completions.bulkAdd(data.completions);
  });
}
