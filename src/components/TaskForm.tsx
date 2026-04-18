import { useEffect, useState } from 'react';
import type { Recurrence, Task, TaskType } from '../lib/db';
import { db } from '../lib/db';
import { todayISO } from '../lib/date';

export function TaskForm({
  type,
  editing,
  defaultPeriodStart,
  defaultPeriodEnd,
  onClose,
}: {
  type: TaskType;
  editing?: Task;
  defaultPeriodStart?: string;
  defaultPeriodEnd?: string;
  onClose: () => void;
}) {
  const INDEFINITE_END = '2099-12-31';

  const initialRecurrence: Recurrence =
    editing?.recurrence ?? (type === 'monthly' ? 'monthly' : 'weekly');

  const [name, setName] = useState(editing?.name ?? '');
  const [periodStart, setPeriodStart] = useState(
    editing?.periodStart ?? defaultPeriodStart ?? todayISO(),
  );
  const [indefinite, setIndefinite] = useState(
    editing ? editing.periodEnd >= INDEFINITE_END : initialRecurrence !== 'none',
  );
  const [periodEnd, setPeriodEnd] = useState(() => {
    if (editing) {
      return editing.periodEnd >= INDEFINITE_END
        ? (defaultPeriodEnd ?? todayISO())
        : editing.periodEnd;
    }
    return defaultPeriodEnd ?? todayISO();
  });
  const [recurrence, setRecurrence] = useState<Recurrence>(initialRecurrence);

  useEffect(() => {
    if (!indefinite && periodStart > periodEnd) setPeriodEnd(periodStart);
  }, [periodStart, periodEnd, indefinite]);

  // When user picks "繰り返さない", auto-disable indefinite.
  useEffect(() => {
    if (recurrence === 'none' && indefinite) setIndefinite(false);
  }, [recurrence, indefinite]);

  const effectiveEnd = indefinite ? INDEFINITE_END : periodEnd;
  const canSave = name.trim().length > 0 && periodStart && effectiveEnd;

  async function save() {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      type,
      periodStart,
      periodEnd: effectiveEnd,
      recurrence,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    if (editing) {
      await db.tasks.update(editing.id, payload);
    } else {
      await db.tasks.add(payload as Task);
    }
    onClose();
  }

  async function remove() {
    if (!editing) return;
    if (!confirm('このタスクを削除しますか？完了履歴も消えます。')) return;
    await db.transaction('rw', db.tasks, db.completions, async () => {
      await db.completions.where('taskId').equals(editing.id).delete();
      await db.tasks.delete(editing.id);
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/30 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-paper w-full max-w-xl rounded-t-2xl sm:rounded-2xl p-5 pb-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-hand text-xl">
            {editing ? 'タスクを編集' : type === 'monthly' ? '月のタスクを追加' : '2週間のタスクを追加'}
          </h2>
          <button onClick={onClose} className="text-muted text-sm" type="button">
            閉じる
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted">タスク名</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：歯みがく"
              className="mt-1 w-full bg-transparent border-b border-ink/40 focus:border-ink outline-none py-2 text-base"
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted">開始日</span>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="mt-1 w-full bg-transparent border-b border-ink/40 focus:border-ink outline-none py-2"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">終了日</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                disabled={indefinite}
                className="mt-1 w-full bg-transparent border-b border-ink/40 focus:border-ink outline-none py-2 disabled:opacity-40"
              />
            </label>
          </div>

          {recurrence !== 'none' && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={indefinite}
                onChange={(e) => setIndefinite(e.target.checked)}
                className="accent-ink"
              />
              <span>無期限（次の月/週にも自動で表示する）</span>
            </label>
          )}

          <div>
            <span className="text-xs text-muted">繰り返し</span>
            <div className="mt-2 flex gap-2 flex-wrap">
              {(
                [
                  { v: 'none', label: '繰り返さない' },
                  { v: 'daily', label: '毎日' },
                  { v: 'weekly', label: '毎週' },
                  { v: 'monthly', label: '毎月' },
                ] as { v: Recurrence; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setRecurrence(opt.v)}
                  className={`px-3 py-1.5 text-sm hand-box ${
                    recurrence === opt.v ? 'bg-ink text-paper' : 'text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {editing ? (
            <button
              type="button"
              onClick={remove}
              className="text-sm text-red-700"
            >
              削除
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="px-5 py-2 bg-ink text-paper rounded-full disabled:opacity-40 font-hand tracking-wider"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
