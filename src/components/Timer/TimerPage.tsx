import { useState, useEffect, useRef } from 'react';
import { Play, Square, Droplets, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import CircularTimer from './CircularTimer';
import HealthStageBar from './HealthStageBar';
import StartTimePicker from './StartTimePicker';
import GoalPicker from './GoalPicker';
import { FASTING_PROTOCOLS, getProtocol } from '../../utils/protocols';
import type { FastingProtocolId } from '../../types';
import clsx from 'clsx';

type ActivePicker = 'start' | 'goal' | null;

function formatPillTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function TimerPage() {
  const { state, startFast, endFast, dispatch } = useApp();
  const { currentFast, settings, waterLog } = state;
  const [now, setNow] = useState(Date.now());
  const [showEndModal, setShowEndModal] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<FastingProtocolId>(settings.defaultProtocol);
  const [note, setNote] = useState('');
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [editStartValue, setEditStartValue] = useState(Date.now());
  const [editGoalHours, setEditGoalHours] = useState(16);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const elapsedMs = currentFast ? now - currentFast.startTime : 0;
  const targetMs = currentFast
    ? currentFast.targetHours * 3600000
    : getProtocol(selectedProtocol).fastHours * 3600000;

  const goalEndTime = currentFast ? currentFast.startTime + targetMs : null;

  function openPicker(which: ActivePicker) {
    if (!currentFast) return;
    if (which === 'start') setEditStartValue(currentFast.startTime);
    if (which === 'goal') setEditGoalHours(currentFast.targetHours);
    setActivePicker(which);
  }

  function savePicker() {
    if (activePicker === 'start') {
      dispatch({ type: 'UPDATE_CURRENT_START', payload: editStartValue });
    } else if (activePicker === 'goal') {
      dispatch({ type: 'UPDATE_CURRENT_TARGET', payload: editGoalHours });
    }
    setActivePicker(null);
  }

  // Today's water
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayWater = waterLog
    .filter((w) => w.timestamp >= todayStart.getTime())
    .reduce((sum, w) => sum + w.amount, 0);
  const waterGoal = settings.dailyWaterGoal;
  const waterPercent = Math.min((todayWater / waterGoal) * 100, 100);

  const protocol = getProtocol(selectedProtocol);
  const difficultyColor = {
    beginner: 'text-green-500 bg-green-500/10',
    intermediate: 'text-amber-500 bg-amber-500/10',
    advanced: 'text-red-500 bg-red-500/10',
  };

  function handleStart() {
    startFast(
      selectedProtocol,
      selectedProtocol === 'custom' ? settings.customFastHours : undefined,
    );
    setShowProtocols(false);
  }

  function handleEnd() {
    endFast(note);
    setNote('');
    setShowEndModal(false);
  }

  function addWater(ml: number) {
    dispatch({ type: 'ADD_WATER', payload: { amount: ml } });
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Title */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {currentFast ? 'Fasting in Progress' : 'Start Your Fast'}
        </h1>
      </div>

      {/* Circular Timer */}
      <div className="flex justify-center">
        <CircularTimer
          elapsedMs={elapsedMs}
          targetMs={targetMs}
          isRunning={!!currentFast}
          size={280}
        />
      </div>

      {/* Started / Goal pills — only while fasting */}
      {currentFast && (
        <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {/* Started pill */}
          <button
            className={clsx(
              'flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors',
              activePicker === 'start'
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
            )}
            onClick={() => openPicker(activePicker === 'start' ? null : 'start')}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              Started
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {formatPillTime(currentFast.startTime)}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px bg-slate-200 dark:bg-slate-700 self-stretch" />

          {/* Goal pill */}
          <button
            className={clsx(
              'flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors',
              activePicker === 'goal'
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
            )}
            onClick={() => openPicker(activePicker === 'goal' ? null : 'goal')}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              {currentFast.targetHours}H Goal
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {goalEndTime ? formatPillTime(goalEndTime) : '—'}
            </span>
          </button>
        </div>
      )}

      {/* Inline pickers */}
      {currentFast && activePicker && (
        <div className="flex flex-col items-center gap-3">
          {activePicker === 'start' && (
            <StartTimePicker initialValue={editStartValue} onChange={setEditStartValue} />
          )}
          {activePicker === 'goal' && (
            <GoalPicker targetHours={editGoalHours} onChange={setEditGoalHours} />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setActivePicker(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={savePicker}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Protocol Selector (when not fasting) */}
      {!currentFast && (
        <div className="space-y-3">
          <button
            onClick={() => setShowProtocols(!showProtocols)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div className="text-left">
                <p className="font-semibold">{protocol.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{protocol.fastHours}h fast · {protocol.eatHours}h eat</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium capitalize', difficultyColor[protocol.difficulty])}>
                {protocol.difficulty}
              </span>
              <ChevronDown className={clsx('w-4 h-4 text-slate-400 transition-transform', showProtocols && 'rotate-180')} />
            </div>
          </button>

          {showProtocols && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {FASTING_PROTOCOLS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProtocol(p.id); setShowProtocols(false); }}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-0',
                    selectedProtocol === p.id && 'bg-orange-50 dark:bg-orange-900/20'
                  )}
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                  </div>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium capitalize ml-2 flex-shrink-0', difficultyColor[p.difficulty])}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Start / End Fast button */}
      <div>
        {!currentFast ? (
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Fast
          </button>
        ) : (
          <button
            onClick={() => setShowEndModal(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            <Square className="w-5 h-5 fill-current" />
            End Fast
          </button>
        )}
      </div>

      {/* Health Stages */}
      {currentFast && (
        <HealthStageBar elapsedMs={elapsedMs} targetMs={targetMs} />
      )}

      {/* Water Tracker */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-slate-800 dark:text-white">Hydration</span>
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {(todayWater / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${waterPercent}%` }}
          />
        </div>
        <div className="flex gap-2">
          {[150, 250, 350, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium transition-colors"
            >
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      {/* End Fast Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">End Your Fast?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              You've fasted for{' '}
              <strong>{(elapsedMs / 3600000).toFixed(1)} hours</strong>
              {elapsedMs >= targetMs ? ' — Goal achieved! 🎉' : ''}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm resize-none border-none outline-none focus:ring-2 focus:ring-orange-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
              >
                Keep Going
              </button>
              <button
                onClick={handleEnd}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
              >
                End Fast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
