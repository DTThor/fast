import { useState } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Minus as TrendingFlat } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDateTime } from '../../utils/format';
import type { WeightEntry } from '../../types';

export default function WeightPage() {
  const { state, dispatch } = useApp();
  const { weightLog, settings } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputNote, setInputNote] = useState('');
  const [inputUnit, setInputUnit] = useState<'kg' | 'lbs'>(settings.weightUnit);

  const sorted = [...weightLog].sort((a, b) => b.date - a.date);

  // Convert to display unit
  function toDisplayUnit(entry: WeightEntry): number {
    if (entry.unit === settings.weightUnit) return entry.weight;
    if (settings.weightUnit === 'lbs') return entry.weight * 2.20462;
    return entry.weight / 2.20462;
  }

  const displayWeights = sorted.map((e) => ({ ...e, displayWeight: toDisplayUnit(e) }));

  // Stats
  const latestWeight = displayWeights[0]?.displayWeight;
  const prevWeight = displayWeights[1]?.displayWeight;
  const change = latestWeight != null && prevWeight != null ? latestWeight - prevWeight : null;
  const totalChange = displayWeights.length >= 2
    ? displayWeights[0].displayWeight - displayWeights[displayWeights.length - 1].displayWeight
    : null;

  // BMI hint (very basic)
  function handleAdd() {
    const w = parseFloat(inputWeight);
    if (isNaN(w) || w <= 0) return;
    dispatch({
      type: 'ADD_WEIGHT',
      payload: { date: Date.now(), weight: w, unit: inputUnit, note: inputNote || undefined },
    });
    setInputWeight('');
    setInputNote('');
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this weight entry?')) {
      dispatch({ type: 'DELETE_WEIGHT', payload: id });
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Weight</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {weightLog.length} {weightLog.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Weight
        </button>
      </div>

      {/* Quick stats */}
      {latestWeight != null && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Current</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {latestWeight.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500">{settings.weightUnit}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Change</p>
            {change != null ? (
              <div className="flex items-center gap-1">
                {change < 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ) : change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingFlat className="w-4 h-4 text-slate-400" />
                )}
                <p className={`text-lg font-bold ${change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-slate-400">—</p>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Change</p>
            {totalChange != null ? (
              <p className={`text-lg font-bold ${totalChange < 0 ? 'text-green-500' : totalChange > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}
              </p>
            ) : (
              <p className="text-lg font-bold text-slate-400">—</p>
            )}
          </div>
        </div>
      )}

      {/* Add weight form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-orange-200 dark:border-orange-800">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Log Weight</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              step="0.1"
              min="0"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              placeholder="Weight"
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm border-none outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              {(['kg', 'lbs'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setInputUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    inputUnit === u
                      ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            placeholder="Note (optional)"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm border-none outline-none focus:ring-2 focus:ring-orange-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!inputWeight}
              className="flex-1 py-2.5 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Weight Log */}
      {displayWeights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">⚖️</span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No weight logged yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Track your weight to see trends over time
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayWeights.map((entry, i) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-lg text-slate-800 dark:text-white">
                    {entry.displayWeight.toFixed(1)} {settings.weightUnit}
                  </span>
                  {i > 0 && (() => {
                    const diff = entry.displayWeight - displayWeights[i - 1].displayWeight;
                    return (
                      <span className={`text-xs font-medium ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-green-500' : 'text-slate-400'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-sm text-slate-400">{formatDateTime(entry.date)}</p>
                {entry.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">"{entry.note}"</p>}
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="p-2 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
