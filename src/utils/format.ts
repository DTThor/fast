export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatHours(ms: number): string {
  const hours = ms / 3600000;
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours % 1 === 0) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatWeight(weight: number, unit: 'kg' | 'lbs'): string {
  return `${weight.toFixed(1)} ${unit}`;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function getStreakCount(history: { startTime: number; endTime: number | null; completed: boolean }[]): number {
  if (!history.length) return 0;

  const completed = history.filter((f) => f.endTime && f.completed);
  if (!completed.length) return 0;

  const sorted = [...completed].sort((a, b) => b.startTime - a.startTime);
  let streak = 0;
  let prevDay: number | null = null;

  for (const fast of sorted) {
    const day = new Date(fast.startTime);
    day.setHours(0, 0, 0, 0);
    const dayTs = day.getTime();

    if (prevDay === null) {
      streak = 1;
      prevDay = dayTs;
    } else {
      const diff = prevDay - dayTs;
      if (diff <= 86400000 * 1.5) {
        // within ~1.5 days = consecutive
        streak++;
        prevDay = dayTs;
      } else {
        break;
      }
    }
  }

  return streak;
}
