import { HEALTH_STAGES, getCurrentStage, getNextStage } from '../../utils/healthStages';

interface HealthStageBarProps {
  elapsedMs: number;
  targetMs: number;
}

export default function HealthStageBar({ elapsedMs, targetMs }: HealthStageBarProps) {
  const elapsedHours = elapsedMs / 3600000;
  const targetHours = targetMs / 3600000;
  const currentStage = getCurrentStage(elapsedHours);
  const nextStage = getNextStage(elapsedHours);

  const hoursUntilNext = nextStage ? nextStage.hour - elapsedHours : 0;

  // Find relevant stages for the timeline (up to target)
  const relevantStages = HEALTH_STAGES.filter((s) => s.hour <= Math.max(targetHours, elapsedHours) + 4);

  return (
    <div className="w-full space-y-4">
      {/* Current stage card */}
      <div
        className="rounded-2xl p-4 border border-white/20"
        style={{ background: `${currentStage.color}18`, borderColor: `${currentStage.color}40` }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{currentStage.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-800 dark:text-white">{currentStage.title}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${currentStage.color}30`, color: currentStage.color }}
              >
                {currentStage.hour === 0 ? 'Current' : `${currentStage.hour}h+`}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{currentStage.description}</p>
            {nextStage && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Next: <span className="font-medium">{nextStage.icon} {nextStage.title}</span> in{' '}
                {hoursUntilNext < 1
                  ? `${Math.round(hoursUntilNext * 60)}m`
                  : `${hoursUntilNext.toFixed(1)}h`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stage timeline */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Fasting Timeline
        </p>
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
            {relevantStages.map((stage) => {
              const reached = elapsedHours >= stage.hour;
              const isCurrent = stage === currentStage;
              return (
                <div
                  key={stage.hour}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-800 shadow-lg scale-105'
                      : reached
                      ? 'bg-white/60 dark:bg-slate-800/60'
                      : 'bg-slate-100/60 dark:bg-slate-800/30 opacity-50'
                  }`}
                  style={{
                    borderColor: isCurrent ? stage.color : reached ? `${stage.color}50` : 'transparent',
                    minWidth: '72px',
                  }}
                >
                  <span className="text-xl">{stage.icon}</span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: reached ? stage.color : '#94a3b8' }}
                  >
                    {stage.hour}h
                  </span>
                  <span className="text-xs text-center text-slate-500 dark:text-slate-400 leading-tight" style={{ fontSize: '10px' }}>
                    {stage.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
