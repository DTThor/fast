import { useState } from 'react';
import DrumColumn from './DrumColumn';

interface GoalPickerProps {
  targetHours: number;
  onChange: (hours: number) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => `${i}d`);
const HOURS = Array.from({ length: 12 }, (_, i) => `${i + 12}h`); // 12–23

function decompose(totalHours: number) {
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  // Clamp hours into 12–23 range
  const clampedHours = Math.max(12, Math.min(23, hours));
  return {
    dayIdx: Math.max(0, Math.min(days, 30)),
    hourIdx: clampedHours - 12,
  };
}

export default function GoalPicker({ targetHours, onChange }: GoalPickerProps) {
  const init = decompose(targetHours);
  const [dayIdx, setDayIdx] = useState(init.dayIdx);
  const [hourIdx, setHourIdx] = useState(init.hourIdx);

  function update(newDayIdx: number, newHourIdx: number) {
    const total = newDayIdx * 24 + (newHourIdx + 12);
    onChange(total);
  }

  function handleDayChange(i: number) {
    setDayIdx(i);
    update(i, hourIdx);
  }

  function handleHourChange(i: number) {
    setHourIdx(i);
    update(dayIdx, i);
  }

  return (
    <div className="flex items-center justify-center gap-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1 shadow-inner">
      <DrumColumn items={DAYS} selectedIndex={dayIdx} onChange={handleDayChange} width={64} />
      <div className="text-slate-300 dark:text-slate-600 font-bold text-base select-none mx-1">+</div>
      <DrumColumn items={HOURS} selectedIndex={hourIdx} onChange={handleHourChange} width={64} />
    </div>
  );
}
