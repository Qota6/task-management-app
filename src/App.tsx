import { useState } from 'react';
import { TabBar } from './components/TabBar';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { SettingsView } from './views/SettingsView';

export type ViewTab = 'month' | 'week' | 'settings';

export default function App() {
  const [tab, setTab] = useState<ViewTab>('month');

  return (
    <div className="min-h-full max-w-xl mx-auto pb-24 pt-2 px-4">
      {tab === 'month' && <MonthView />}
      {tab === 'week' && <WeekView />}
      {tab === 'settings' && <SettingsView />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
