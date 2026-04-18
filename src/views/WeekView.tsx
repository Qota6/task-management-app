import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '../lib/db';
import {
  addDays,
  formatShortRange,
  fromISODate,
  todayISO,
} from '../lib/date';
import { isTaskActiveInRange } from '../lib/recurrence';
import { HandCheckbox, HandPlus, HandSquiggle } from '../components/HandDrawn';
import { TaskForm } from '../components/TaskForm';
import { TaskDetail } from '../components/TaskDetail';

export function WeekView() {
  const [startISO, setStartISO] = useState<string>(() => todayISO());
  const [showForm, setShowForm] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const start = useMemo(() => fromISODate(startISO), [startISO]);
  const end = useMemo(() => addDays(start, 13), [start]);

  const tasks = useLiveQuery(async () => {
    const all = await db.tasks.where('type').equals('weekly').toArray();
    return all
      .filter((t) => !t.archivedAt)
      .filter((t) => isTaskActiveInRange(t, start, end))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [start, end]);

  const completions = useLiveQuery(async () => {
    if (!tasks || tasks.length === 0) return [];
    return db.completions
      .where('taskId')
      .anyOf(tasks.map((t) => t.id))
      .toArray();
  }, [tasks]);

  function countInRange(taskId: number): number {
    if (!completions) return 0;
    return completions.filter((c) => {
      if (c.taskId !== taskId) return false;
      const t = new Date(c.completedAt);
      return t >= start && t <= addDays(end, 1);
    }).length;
  }

  async function addCompletion(task: Task) {
    await db.completions.add({
      taskId: task.id,
      completedAt: new Date().toISOString(),
    } as never);
  }

  async function removeLatest(task: Task) {
    const rangeStart = start.toISOString();
    const rangeEnd = addDays(end, 1).toISOString();
    const list = await db.completions
      .where('taskId')
      .equals(task.id)
      .filter((c) => c.completedAt >= rangeStart && c.completedAt < rangeEnd)
      .reverse()
      .sortBy('completedAt');
    const latest = list[0];
    if (latest) await db.completions.delete(latest.id);
  }

  function shiftRange(days: number) {
    setStartISO((iso) => {
      const d = addDays(fromISODate(iso), days);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-3">
        <button
          onClick={() => shiftRange(-14)}
          className="text-muted px-2 py-1"
          type="button"
          aria-label="前の2週間"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-hand text-2xl ink-underline inline-block">
            2 WEEK PLAN
          </div>
          <div className="text-sm text-muted mt-1">
            {formatShortRange(start, end)}
          </div>
        </div>
        <button
          onClick={() => shiftRange(14)}
          className="text-muted px-2 py-1"
          type="button"
          aria-label="次の2週間"
        >
          ›
        </button>
      </header>

      <div className="flex items-center gap-2 mb-4 text-xs text-muted">
        <label className="flex items-center gap-1">
          開始日
          <input
            type="date"
            value={startISO}
            onChange={(e) => setStartISO(e.target.value)}
            className="bg-transparent border-b border-ink/30 outline-none px-1"
          />
        </label>
        <button
          type="button"
          onClick={() => setStartISO(todayISO())}
          className="ml-auto px-2 py-1 hand-box text-ink text-xs"
        >
          今日から
        </button>
      </div>

      {tasks && tasks.length === 0 && (
        <div className="mt-10 text-center text-muted text-sm">
          <HandSquiggle width={80} height={18} style={{ margin: '0 auto 8px' }} />
          タスクがまだありません。
          <br />
          右下の「+」から追加しましょう。
        </div>
      )}

      <ul className="space-y-2">
        {tasks?.map((task) => {
          const n = countInRange(task.id);
          return (
            <li
              key={task.id}
              className="hand-box bg-white/40 px-3 py-3 flex items-center gap-3"
            >
              <HandCheckbox
                checked={n > 0}
                onClick={() => addCompletion(task)}
              />
              <button
                type="button"
                onClick={() => setDetailTask(task)}
                className="flex-1 text-left"
              >
                <div className="text-base">{task.name}</div>
                {n > 0 && (
                  <div className="text-xs text-muted mt-0.5">
                    期間中 {n} 回完了
                  </div>
                )}
              </button>
              {n > 0 && (
                <button
                  type="button"
                  onClick={() => removeLatest(task)}
                  className="text-xs text-muted px-2"
                  aria-label="直近の完了を取り消す"
                >
                  取消
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="fixed bottom-20 right-6 z-30">
        <HandPlus onClick={() => setShowForm(true)} label="タスクを追加" />
      </div>

      {showForm && (
        <TaskForm
          type="weekly"
          defaultPeriodStart={startISO}
          defaultPeriodEnd={(() => {
            const d = addDays(start, 13);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          })()}
          onClose={() => setShowForm(false)}
        />
      )}

      {detailTask && (
        <TaskDetail task={detailTask} onClose={() => setDetailTask(null)} />
      )}
    </div>
  );
}
