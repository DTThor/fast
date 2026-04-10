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
    <div className="min-h-svh bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Main content area */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {page === 'timer' && <TimerPage />}
        {page === 'history' && <HistoryPage />}
        {page === 'stats' && <StatsPage />}
        {page === 'weight' && <WeightPage />}
        {page === 'settings' && <SettingsPage />}
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
