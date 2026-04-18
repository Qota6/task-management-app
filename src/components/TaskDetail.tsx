import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '../lib/db';
import { formatDateTimeJP } from '../lib/date';
import { TaskForm } from './TaskForm';

export function TaskDetail({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const completions = useLiveQuery(async () => {
    return db.completions
      .where('taskId')
      .equals(task.id)
      .reverse()
      .sortBy('completedAt');
  }, [task.id]);

  async function deleteCompletion(id: number) {
    await db.completions.delete(id);
  }

  return (
    <div
      className="fixed inset-0 z-30 bg-black/30 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-paper w-full max-w-xl rounded-t-2xl sm:rounded-2xl p-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-hand text-xl">{task.name}</h2>
          <button type="button" onClick={onClose} className="text-muted text-sm">
            閉じる
          </button>
        </div>

        <div className="text-xs text-muted mb-4 space-y-0.5">
          <div>種別: {task.type === 'monthly' ? '月次' : '2週間'}</div>
          <div>
            期間: {task.periodStart} 〜 {task.periodEnd}
          </div>
          <div>
            繰り返し:{' '}
            {task.recurrence === 'none'
              ? 'なし'
              : task.recurrence === 'daily'
                ? '毎日'
                : task.recurrence === 'weekly'
                  ? '毎週'
                  : '毎月'}
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="font-hand text-lg">完了履歴</div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-ink px-3 py-1 hand-box"
          >
            編集
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-line hand-box bg-white/40">
          {completions && completions.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted">
              まだ完了していません
            </div>
          )}
          {completions?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <div className="text-sm">
                {formatDateTimeJP(new Date(c.completedAt))}
                {c.weekOfMonth && (
                  <span className="text-xs text-muted ml-2">
                    第{c.weekOfMonth}週
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => deleteCompletion(c.id)}
                className="text-xs text-muted px-2"
              >
                削除
              </button>
            </div>
          ))}
        </div>

        {editing && (
          <TaskForm
            type={task.type}
            editing={task}
            onClose={() => {
              setEditing(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
