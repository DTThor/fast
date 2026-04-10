import { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import BottomNav, { type Page } from './components/Nav/BottomNav';
import TimerPage from './components/Timer/TimerPage';
import HistoryPage from './components/History/HistoryPage';
import StatsPage from './components/Stats/StatsPage';
import WeightPage from './components/Weight/WeightPage';
import SettingsPage from './components/Settings/SettingsPage';

function AppContent() {
  const [page, setPage] = useState<Page>('timer');
  const { state } = useApp();
  const fastingActive = !!state.currentFast;

  return (
    <div
      className="flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors"
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Scrollable content — fills all space above the nav */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          {page === 'timer' && <TimerPage />}
          {page === 'history' && <HistoryPage />}
          {page === 'stats' && <StatsPage />}
          {page === 'weight' && <WeightPage />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Bottom navigation — in-flow, not fixed */}
      <BottomNav current={page} onChange={setPage} fastingActive={fastingActive} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
