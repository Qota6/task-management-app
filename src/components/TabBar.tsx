import type { ViewTab } from '../App';

const tabs: { id: ViewTab; label: string }[] = [
  { id: 'month', label: 'MONTH' },
  { id: 'week', label: '2 WEEK' },
  { id: 'settings', label: 'SETTINGS' },
];

export function TabBar({
  active,
  onChange,
}: {
  active: ViewTab;
  onChange: (t: ViewTab) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-paper border-t border-line"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-xl mx-auto grid grid-cols-3">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`py-3 text-xs tracking-[0.2em] font-hand ${
                isActive ? 'text-ink' : 'text-muted'
              }`}
            >
              <span className={isActive ? 'ink-underline' : ''}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
