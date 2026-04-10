import { useState } from 'react';
import DrumColumn from './DrumColumn';

interface GoalPickerProps {
  targetHours: number;
  onChange: (hours: number) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => `${i}d`);
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}h`); // 0–23

function decompose(totalHours: number) {
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return {
    dayIdx: Math.max(0, Math.min(days, 30)),
    hourIdx: Math.max(0, Math.min(hours, 23)),
  };
}

export default function GoalPicker({ targetHours, onChange }: GoalPickerProps) {
  const init = decompose(targetHours);
  const [dayIdx, setDayIdx] = useState(init.dayIdx);
  const [hourIdx, setHourIdx] = useState(init.hourIdx);

  function update(newDayIdx: number, newHourIdx: number) {
    const total = newDayIdx * 24 + newHourIdx;
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
