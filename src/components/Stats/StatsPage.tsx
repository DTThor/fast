import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { useApp } from '../../store/AppContext';
import { formatDate } from '../../utils/format';
import { getProtocol } from '../../utils/protocols';
import clsx from 'clsx';

type Period = '7d' | '30d' | 'all';

export default function StatsPage() {
  const { state } = useApp();
  const { fastHistory, weightLog, settings } = state;
  const [period, setPeriod] = useState<Period>('30d');

  const cutoff = useMemo(() => {
    if (period === '7d') return Date.now() - 7 * 86400000;
    if (period === '30d') return Date.now() - 30 * 86400000;
    return 0;
  }, [period]);

  const filtered = useMemo(
    () => fastHistory.filter((f) => f.endTime && f.startTime >= cutoff),
    [fastHistory, cutoff]
  );

  // Fast duration chart data
  const fastData = useMemo(() => {
    return filtered.map((f) => ({
      date: formatDate(f.startTime),
      hours: parseFloat(((f.endTime! - f.startTime) / 3600000).toFixed(1)),
      target: f.targetHours,
      completed: f.completed,
    })).reverse();
  }, [filtered]);

  // Weight chart data
  const weightData = useMemo(() => {
    return weightLog
      .filter((w) => w.date >= cutoff)
      .map((w) => ({
        date: formatDate(w.date),
        weight: settings.weightUnit === 'lbs' && w.unit === 'kg'
          ? parseFloat((w.weight * 2.20462).toFixed(1))
          : settings.weightUnit === 'kg' && w.unit === 'lbs'
          ? parseFloat((w.weight / 2.20462).toFixed(1))
          : w.weight,
        unit: settings.weightUnit,
      }))
      .reverse();
  }, [weightLog, cutoff, settings.weightUnit]);

  // Summary stats
  const totalFasts = filtered.length;
  const completedFasts = filtered.filter((f) => f.completed).length;
  const successRate = totalFasts > 0 ? Math.round((completedFasts / totalFasts) * 100) : 0;
  const avgHours = totalFasts > 0
    ? (filtered.reduce((sum, f) => sum + (f.endTime! - f.startTime) / 3600000, 0) / totalFasts)
    : 0;
  const totalHours = filtered.reduce((sum, f) => sum + (f.endTime! - f.startTime) / 3600000, 0);
  const longestFast = filtered.reduce((max, f) => Math.max(max, (f.endTime! - f.startTime) / 3600000), 0);

  // Protocol breakdown
  const protocolBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of filtered) {
      counts[f.protocolId] = (counts[f.protocolId] ?? 0) + 1;
    }
    return Object.entries(counts).map(([id, count]) => ({
      name: getProtocol(id).name,
      count,
      pct: totalFasts > 0 ? Math.round((count / totalFasts) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [filtered, totalFasts]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Statistics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your fasting insights</p>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['7d', '30d', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                period === p
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Total Fasts" value={String(totalFasts)} />
        <MiniStat label="Success Rate" value={`${successRate}%`} color={successRate >= 80 ? 'green' : successRate >= 50 ? 'amber' : 'red'} />
        <MiniStat label="Avg Duration" value={avgHours > 0 ? `${avgHours.toFixed(1)}h` : '—'} />
        <MiniStat label="Longest Fast" value={longestFast > 0 ? `${longestFast.toFixed(1)}h` : '—'} />
        <MiniStat label="Total Hours" value={totalHours > 0 ? `${Math.round(totalHours)}h` : '—'} />
        <MiniStat label="Total Days" value={totalHours > 0 ? `${(totalHours / 24).toFixed(1)}d` : '—'} />
      </div>

      {/* Fast Duration Chart */}
      {fastData.length > 0 ? (
        <ChartCard title="Fast Duration (hours)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fastData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [`${v}h`, 'Duration']}
              />
              <ReferenceLine y={16} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {fastData.map((d, i) => (
                  <Cell key={i} fill={d.completed ? '#f97316' : '#94a3b8'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-1">Purple = goal reached · Gray = incomplete</p>
        </ChartCard>
      ) : (
        <EmptyChart title="Fast Duration" message="No fasts in this period" />
      )}

      {/* Weight Chart */}
      {weightData.length > 1 ? (
        <ChartCard title={`Weight (${settings.weightUnit})`}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [`${v} ${settings.weightUnit}`, 'Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ fill: '#f97316', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : weightData.length === 1 ? (
        <ChartCard title={`Weight (${settings.weightUnit})`}>
          <p className="text-center text-slate-400 py-8">Add more weight entries to see trend</p>
        </ChartCard>
      ) : (
        <EmptyChart title="Weight" message="No weight logged in this period" />
      )}

      {/* Protocol breakdown */}
      {protocolBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Protocols Used</h3>
          <div className="space-y-2.5">
            {protocolBreakdown.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-16 flex-shrink-0">{p.name}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-12 text-right">{p.count}x ({p.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: 'green' | 'amber' | 'red' }) {
  const colorClass = {
    green: 'text-green-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={clsx('text-xl font-bold', color ? colorClass[color] : 'text-slate-800 dark:text-white')}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
      <div className="flex items-center justify-center h-24 text-slate-400 text-sm">{message}</div>
    </div>
  );
}
