import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Flame, Trophy, Target, Calendar } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDuration, formatDateTime, formatDate, getStreakCount } from '../../utils/format';
import { getProtocol } from '../../utils/protocols';
import clsx from 'clsx';

export default function HistoryPage() {
  const { state, dispatch } = useApp();
  const { fastHistory, currentFast } = state;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const streak = getStreakCount(fastHistory);
  const longestStreak = getLongestStreak(fastHistory);
  const completedFasts = fastHistory.filter((f) => f.completed);
  const avgFastHours = fastHistory.length > 0
    ? (fastHistory.filter((f) => f.endTime).reduce((sum, f) => sum + (f.endTime! - f.startTime), 0) / fastHistory.filter((f) => f.endTime).length / 3600000)
    : 0;

  function handleDelete(id: string) {
    if (window.confirm('Delete this fast from history?')) {
      dispatch({ type: 'DELETE_FAST', payload: id });
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {fastHistory.length} fasts logged
        </p>
      </div>

      {/* Streak & Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Current Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          highlight={streak > 0}
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-yellow-500" />}
          label="Best Streak"
          value={`${longestStreak} day${longestStreak !== 1 ? 's' : ''}`}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-green-500" />}
          label="Goals Hit"
          value={`${completedFasts.length} / ${fastHistory.length}`}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-orange-500" />}
          label="Avg Fast"
          value={avgFastHours > 0 ? `${avgFastHours.toFixed(1)}h` : '—'}
        />
      </div>

      {/* Current fast (if running) */}
      {currentFast && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Currently Fasting</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Started {formatDateTime(currentFast.startTime)}
          </p>
        </div>
      )}

      {/* Fast list */}
      {fastHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🕐</span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No fasts yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Start your first fast to see history here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fastHistory.map((fast) => {
            const durationMs = fast.endTime ? fast.endTime - fast.startTime : Date.now() - fast.startTime;
            const durationHours = durationMs / 3600000;
            const protocol = getProtocol(fast.protocolId);
            const isExpanded = expandedId === fast.id;
            const pct = Math.min((durationMs / (fast.targetHours * 3600000)) * 100, 100);

            return (
              <div
                key={fast.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : fast.id)}
                >
                  {/* Status icon */}
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                    fast.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'
                  )}>
                    {fast.completed ? '✅' : '⏱️'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {durationHours.toFixed(1)}h fast
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(fast.startTime)}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all', fast.completed ? 'bg-green-400' : 'bg-orange-400')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{protocol.name}</span>
                      <span className="text-slate-200 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{Math.round(pct)}% of goal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Started</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{formatDateTime(fast.startTime)}</p>
                      </div>
                      {fast.endTime && (
                        <div>
                          <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Ended</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{formatDateTime(fast.endTime)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Duration</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{formatDuration(durationMs)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Goal</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{fast.targetHours}h ({protocol.name})</p>
                      </div>
                    </div>
                    {fast.note && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Note</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{fast.note}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(fast.id)}
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={clsx(
      'bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border',
      highlight
        ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
        : 'border-slate-200 dark:border-slate-700'
    )}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500 dark:text-slate-400">{label}</span></div>
      <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

function getLongestStreak(history: { startTime: number; endTime: number | null; completed: boolean }[]): number {
  const completed = history.filter((f) => f.endTime && f.completed);
  if (!completed.length) return 0;

  const days = completed.map((f) => {
    const d = new Date(f.startTime);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const unique = [...new Set(days)].sort((a, b) => a - b);
  let max = 1, curr = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] - unique[i - 1] <= 86400000 * 1.5) {
      curr++;
      max = Math.max(max, curr);
    } else {
      curr = 1;
    }
  }
  return max;
}
