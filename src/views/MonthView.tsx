import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '../lib/db';
import {
  endOfMonth,
  monthLabel,
  startOfMonth,
  weeksInMonth,
} from '../lib/date';
import { isTaskActiveInRange } from '../lib/recurrence';
import { HandPlus, HandSquiggle } from '../components/HandDrawn';
import { TaskForm } from '../components/TaskForm';
import { TaskDetail } from '../components/TaskDetail';

export function MonthView() {
  const [cursor, setCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [showForm, setShowForm] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const weeks = useMemo(
    () => weeksInMonth(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const monthStart = useMemo(
    () => startOfMonth(new Date(cursor.year, cursor.month - 1, 1)),
    [cursor],
  );
  const monthEnd = useMemo(
    () => endOfMonth(new Date(cursor.year, cursor.month - 1, 1)),
    [cursor],
  );

  const tasks = useLiveQuery(async () => {
    const all = await db.tasks.where('type').equals('monthly').toArray();
    return all
      .filter((t) => !t.archivedAt)
      .filter((t) => isTaskActiveInRange(t, monthStart, monthEnd))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [monthStart, monthEnd]);

  const completions = useLiveQuery(async () => {
    if (!tasks || tasks.length === 0) return [];
    return db.completions
      .where('taskId')
      .anyOf(tasks.map((t) => t.id))
      .filter((c) => c.year === cursor.year && c.month === cursor.month)
      .toArray();
  }, [tasks, cursor.year, cursor.month]);

  function countFor(taskId: number, week: number): number {
    if (!completions) return 0;
    return completions.filter(
      (c) => c.taskId === taskId && c.weekOfMonth === week,
    ).length;
  }

  async function increment(task: Task, week: number) {
    await db.completions.add({
      taskId: task.id,
      completedAt: new Date().toISOString(),
      year: cursor.year,
      month: cursor.month,
      weekOfMonth: week,
    } as never);
  }

  function shiftMonth(delta: number) {
    let m = cursor.month + delta;
    let y = cursor.year;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    setCursor({ year: y, month: m });
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="text-muted px-2 py-1"
          aria-label="前の月"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-hand text-2xl ink-underline inline-block">
            MONTHLY PLAN
          </div>
          <div className="text-sm text-muted mt-1">
            {monthLabel(cursor.year, cursor.month)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="text-muted px-2 py-1"
          aria-label="次の月"
        >
          ›
        </button>
      </header>

      {tasks && tasks.length === 0 && (
        <div className="mt-10 text-center text-muted text-sm">
          <HandSquiggle width={80} height={18} style={{ margin: '0 auto 8px' }} />
          タスクがまだありません。
          <br />
          右下の「+」から追加しましょう。
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="hand-border bg-white/40 p-3 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white/40 text-left text-xs text-muted font-normal pb-2 pr-2 min-w-[7rem]">
                  タスク
                </th>
                {weeks.map((w) => (
                  <th
                    key={w.week}
                    className="text-xs text-muted font-normal pb-2 px-1 min-w-[3.4rem]"
                  >
                    <div>第{w.week}週</div>
                    <div className="text-[10px]">
                      {w.start.getMonth() + 1}/{w.start.getDate()}–
                      {w.end.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t border-line">
                  <td className="sticky left-0 bg-white/40 py-2 pr-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setDetailTask(task)}
                      className="text-left hover:underline"
                    >
                      {task.name}
                    </button>
                  </td>
                  {weeks.map((w) => {
                    const n = countFor(task.id, w.week);
                    return (
                      <td
                        key={w.week}
                        className="text-center px-1 py-1 align-middle"
                      >
                        <button
                          type="button"
                          onClick={() => increment(task, w.week)}
                          className="w-full h-10 flex items-center justify-center text-ink active:scale-95"
                          aria-label={`${task.name} 第${w.week}週 完了追加`}
                        >
                          <CellMark count={n} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[10px] text-muted text-right">
            タップで完了追加・タスク名タップで編集と取り消し
          </div>
        </div>
      )}

      <div className="fixed bottom-20 right-6 z-30">
        <HandPlus onClick={() => setShowForm(true)} label="タスクを追加" />
      </div>

      {showForm && (
        <TaskForm
          type="monthly"
          defaultPeriodStart={`${cursor.year}-${String(cursor.month).padStart(2, '0')}-01`}
          defaultPeriodEnd={`${cursor.year}-${String(cursor.month).padStart(2, '0')}-${String(endOfMonth(new Date(cursor.year, cursor.month - 1, 1)).getDate()).padStart(2, '0')}`}
          onClose={() => setShowForm(false)}
        />
      )}

      {detailTask && (
        <TaskDetail task={detailTask} onClose={() => setDetailTask(null)} />
      )}
    </div>
  );
}

function CellMark({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-line">〜</span>;
  }
  if (count === 1) {
    return (
      <svg viewBox="0 0 28 20" width={28} height={20} aria-hidden>
        <path
          d="M4 12 L11 17 L24 4"
          className="hand-check"
          strokeWidth={2.4}
        />
      </svg>
    );
  }
  return (
    <span className="font-hand text-lg">
      <svg
        viewBox="0 0 28 20"
        width={22}
        height={16}
        aria-hidden
        className="inline-block align-middle mr-0.5"
      >
        <path d="M4 12 L11 17 L24 4" className="hand-check" strokeWidth={2.4} />
      </svg>
      ×{count}
    </span>
  );
}
