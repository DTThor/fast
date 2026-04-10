import React from 'react';
import { Sun, Moon, Monitor, Scale, Droplets, Clock } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { FASTING_PROTOCOLS } from '../../utils/protocols';
import type { FastingProtocolId } from '../../types';
import clsx from 'clsx';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  function update<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  }

  const totalFasts = state.fastHistory.length;
  const totalHours = state.fastHistory
    .filter((f) => f.endTime)
    .reduce((sum, f) => sum + (f.endTime! - f.startTime) / 3600000, 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
      </div>

      {/* Profile summary */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            🧑‍💪
          </div>
          <div>
            <p className="font-bold text-lg">Your Stats</p>
            <p className="text-white/70 text-sm">All time</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-white/70 text-xs">Total Fasts</p>
            <p className="font-bold text-xl">{totalFasts}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-white/70 text-xs">Hours Fasted</p>
            <p className="font-bold text-xl">{Math.round(totalHours)}h</p>
          </div>
        </div>
      </div>

      {/* Default Protocol */}
      <Section title="Default Protocol" icon={<Clock className="w-4 h-4" />}>
        <div className="space-y-2">
          {FASTING_PROTOCOLS.map((p) => (
            <button
              key={p.id}
              onClick={() => update('defaultProtocol', p.id as FastingProtocolId)}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left',
                settings.defaultProtocol === p.id
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                  : 'bg-slate-50 dark:bg-slate-700/30 border-transparent'
              )}
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-white text-sm">{p.name}</p>
                <p className="text-xs text-slate-400">{p.fastHours}h fast · {p.description.split('.')[0]}</p>
              </div>
              {settings.defaultProtocol === p.id && (
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}

          {/* Custom hours slider */}
          {settings.defaultProtocol === 'custom' && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Custom fast duration</span>
                <span className="text-sm font-bold text-orange-500">{settings.customFastHours}h</span>
              </div>
              <input
                type="range"
                min={4}
                max={72}
                step={1}
                value={settings.customFastHours}
                onChange={(e) => update('customFastHours', Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>4h</span>
                <span>72h</span>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={<Sun className="w-4 h-4" />}>
        <div className="flex gap-2">
          {([
            { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
            { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
            { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('theme', opt.value)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all',
                settings.theme === opt.value
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-600 dark:text-orange-400'
                  : 'bg-slate-50 dark:bg-slate-700/30 border-transparent text-slate-600 dark:text-slate-400'
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Units */}
      <Section title="Units" icon={<Scale className="w-4 h-4" />}>
        <div className="flex gap-2">
          {(['kg', 'lbs'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => update('weightUnit', unit)}
              className={clsx(
                'flex-1 py-3 rounded-xl border text-sm font-semibold transition-all',
                settings.weightUnit === unit
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-600 dark:text-orange-400'
                  : 'bg-slate-50 dark:bg-slate-700/30 border-transparent text-slate-600 dark:text-slate-400'
              )}
            >
              {unit}
            </button>
          ))}
        </div>
      </Section>

      {/* Water Goal */}
      <Section title="Daily Water Goal" icon={<Droplets className="w-4 h-4" />}>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Goal</span>
            <span className="text-sm font-bold text-blue-500">{(settings.dailyWaterGoal / 1000).toFixed(1)}L ({settings.dailyWaterGoal}ml)</span>
          </div>
          <input
            type="range"
            min={500}
            max={5000}
            step={250}
            value={settings.dailyWaterGoal}
            onChange={(e) => update('dailyWaterGoal', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0.5L</span>
            <span>5L</span>
          </div>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data" icon={null}>
        <div className="space-y-2">
          <button
            onClick={() => {
              if (window.confirm('Clear ALL fast history? This cannot be undone.')) {
                dispatch({ type: 'UPDATE_SETTINGS', payload: {} });
                // Clear history via localStorage directly for now
                const data = JSON.parse(localStorage.getItem('fasting-tracker-v1') || '{}');
                data.fastHistory = [];
                data.currentFast = null;
                localStorage.setItem('fasting-tracker-v1', JSON.stringify(data));
                window.location.reload();
              }
            }}
            className="w-full py-3 text-center text-red-500 hover:text-red-600 text-sm font-medium bg-red-50 dark:bg-red-900/10 rounded-xl transition-colors"
          >
            Clear Fast History
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset ALL data? This cannot be undone.')) {
                localStorage.removeItem('fasting-tracker-v1');
                window.location.reload();
              }
            }}
            className="w-full py-3 text-center text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 dark:bg-red-900/10 rounded-xl transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </Section>

      {/* About */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-600 pb-2">
        <p>FastTrack v1.0 · Built with ❤️</p>
        <p className="mt-0.5">Data stored locally on your device</p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}
