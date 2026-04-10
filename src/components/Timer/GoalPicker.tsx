import DrumColumn from './DrumColumn';

interface GoalPickerProps {
  targetHours: number;
  onChange: (hours: number) => void;
}

// Hours from 4–72
const HOURS = Array.from({ length: 69 }, (_, i) => {
  const h = i + 4;
  return `${h}h`;
});

export default function GoalPicker({ targetHours, onChange }: GoalPickerProps) {
  const selectedIndex = Math.max(0, Math.min(targetHours - 4, HOURS.length - 1));

  return (
    <div className="flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-1 shadow-inner">
      <DrumColumn
        items={HOURS}
        selectedIndex={selectedIndex}
        onChange={(i) => onChange(i + 4)}
        width={80}
      />
    </div>
  );
}
