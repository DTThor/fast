import { useState, useEffect } from 'react';
import DrumColumn from './DrumColumn';

interface StartTimePickerProps {
  initialValue: number; // unix ms
  onChange: (ts: number) => void;
}

// Last N days, most recent first
function buildDays(count = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      date: d,
    };
  });
}

const DAYS = buildDays();
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const AMPM = ['AM', 'PM'];

function initFromTs(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const dayIdx = Math.max(0, Math.round((today.getTime() - day.getTime()) / 86400000));
  const h24 = d.getHours();
  const hourIdx = h24 % 12 === 0 ? 11 : (h24 % 12) - 1;
  const minIdx = d.getMinutes();
  const ampmIdx = h24 >= 12 ? 1 : 0;
  return { dayIdx: Math.min(dayIdx, DAYS.length - 1), hourIdx, minIdx, ampmIdx };
}

function buildTs(dayIdx: number, hourIdx: number, minIdx: number, ampmIdx: number): number {
  const base = new Date(DAYS[dayIdx].date);
  const hour12 = hourIdx + 1; // 1–12
  const hour24 = ampmIdx === 1
    ? (hour12 === 12 ? 12 : hour12 + 12)
    : (hour12 === 12 ? 0 : hour12);
  base.setHours(hour24, minIdx, 0, 0);
  return Math.min(base.getTime(), Date.now()); // never in future
}

export default function StartTimePicker({ initialValue, onChange }: StartTimePickerProps) {
  const init = initFromTs(initialValue);
  const [dayIdx, setDayIdx] = useState(init.dayIdx);
  const [hourIdx, setHourIdx] = useState(init.hourIdx);
  const [minIdx, setMinIdx] = useState(init.minIdx);
  const [ampmIdx, setAmpmIdx] = useState(init.ampmIdx);

  // Emit whenever any column settles
  useEffect(() => {
    onChange(buildTs(dayIdx, hourIdx, minIdx, ampmIdx));
  }, [dayIdx, hourIdx, minIdx, ampmIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex items-center justify-center gap-0.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 shadow-inner"
    >
      <DrumColumn items={DAYS.map(d => d.label)} selectedIndex={dayIdx} onChange={setDayIdx} width={90} />
      <div className="text-slate-300 dark:text-slate-600 font-bold text-base mx-0.5 mb-0.5 select-none">·</div>
      <DrumColumn items={HOURS} selectedIndex={hourIdx} onChange={setHourIdx} width={40} />
      <div className="text-slate-400 dark:text-slate-500 font-bold text-base select-none">:</div>
      <DrumColumn items={MINUTES} selectedIndex={minIdx} onChange={setMinIdx} width={40} />
      <DrumColumn items={AMPM} selectedIndex={ampmIdx} onChange={setAmpmIdx} width={42} />
    </div>
  );
}
