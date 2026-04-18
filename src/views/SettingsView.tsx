import { useEffect, useState } from 'react';
import { exportAllData, importAllData } from '../lib/db';
import { getStorageEstimate, requestPersistentStorage } from '../lib/storage';
import { HandSquiggle } from '../components/HandDrawn';

export function SettingsView() {
  const [info, setInfo] = useState<{
    usage: number;
    quota: number;
    persisted: boolean;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setInfo(await getStorageEstimate());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function enablePersist() {
    const ok = await requestPersistentStorage();
    setMessage(
      ok
        ? '永続化が有効になりました。ブラウザが自動削除しにくくなります。'
        : '永続化が拒否されました。ホーム画面に追加すると成功しやすいです。',
    );
    refresh();
  }

  async function doExport() {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `task-planner-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage(
      'バックアップJSONをダウンロードしました。「ファイル」アプリから iCloud Drive へ保存できます。',
    );
  }

  async function doImport(file: File) {
    if (!confirm('既存のデータを上書きします。よろしいですか？')) return;
    const text = await file.text();
    try {
      await importAllData(text);
      setMessage('復元しました。');
    } catch (e) {
      setMessage(
        `復元に失敗しました: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  return (
    <div>
      <header className="mb-5">
        <div className="font-hand text-2xl ink-underline inline-block">
          SETTINGS
        </div>
      </header>

      <section className="mb-6">
        <h3 className="font-hand text-lg mb-2">ストレージ</h3>
        <div className="hand-box bg-white/40 p-3 text-sm">
          {info ? (
            <>
              <div>
                使用量: {formatBytes(info.usage)} / 上限 {formatBytes(info.quota)}
              </div>
              <div className="mt-1">
                永続化: {info.persisted ? '✔ 有効' : '無効'}
              </div>
            </>
          ) : (
            <div className="text-muted">取得中…</div>
          )}
          {info && !info.persisted && (
            <button
              type="button"
              onClick={enablePersist}
              className="mt-3 px-3 py-1.5 bg-ink text-paper rounded-full text-xs font-hand tracking-wider"
            >
              永続化を有効にする
            </button>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-hand text-lg mb-2">バックアップ / 復元</h3>
        <div className="hand-box bg-white/40 p-3 text-sm space-y-3">
          <p className="text-xs text-muted leading-relaxed">
            完全ローカル保存なので、定期的にバックアップを作って iCloud Drive
            などに保存するのがおすすめです。
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={doExport}
              className="px-3 py-1.5 bg-ink text-paper rounded-full text-xs font-hand tracking-wider"
            >
              エクスポート
            </button>
            <label className="px-3 py-1.5 bg-paper text-ink hand-box text-xs cursor-pointer">
              インポート
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) doImport(f);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {message && (
        <div className="text-xs text-muted flex items-start gap-2">
          <HandSquiggle width={20} height={10} style={{ marginTop: 4 }} />
          <span>{message}</span>
        </div>
      )}

      <div className="mt-10 text-center text-[10px] text-muted">
        <HandSquiggle width={60} height={14} style={{ margin: '0 auto 4px' }} />
        Task Planner · Local only
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}
