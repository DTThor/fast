import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import BottomNav, { type Page } from './components/Nav/BottomNav';
import TimerPage from './components/Timer/TimerPage';
import HistoryPage from './components/History/HistoryPage';
import StatsPage from './components/Stats/StatsPage';
import WeightPage from './components/Weight/WeightPage';
import SettingsPage from './components/Settings/SettingsPage';
import Confetti from './components/Confetti';
import clsx from 'clsx';

function AppContent() {
  const [page, setPage] = useState<Page>('timer');
  const { state } = useApp();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { currentFast } = state;
  const fastingActive = !!currentFast;
  const goalReached = !!(
    currentFast &&
    now >= currentFast.startTime + currentFast.targetHours * 3600000
  );

  return (
    <div
      className={clsx(
        'flex flex-col transition-colors duration-[2000ms]',
        goalReached
          ? 'bg-emerald-50 dark:bg-emerald-950'
          : 'bg-slate-50 dark:bg-slate-900'
      )}
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Confetti overlay — sits behind content */}
      {goalReached && <Confetti />}

      {/* Scrollable content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          {page === 'timer' && <TimerPage />}
          {page === 'history' && <HistoryPage />}
          {page === 'stats' && <StatsPage />}
          {page === 'weight' && <WeightPage />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Bottom navigation */}
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
