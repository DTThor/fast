import { Timer, History, BarChart2, Scale, Settings } from 'lucide-react';
import type { FC, SVGProps } from 'react';
import clsx from 'clsx';

export type Page = 'timer' | 'history' | 'stats' | 'weight' | 'settings';

interface BottomNavProps {
  current: Page;
  onChange: (page: Page) => void;
  fastingActive: boolean;
}

const TABS: { id: Page; label: string; Icon: FC<SVGProps<SVGSVGElement>> }[] = [
  { id: 'timer', label: 'Fast', Icon: Timer },
  { id: 'history', label: 'Log', Icon: History },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
  { id: 'weight', label: 'Weight', Icon: Scale },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav({ current, onChange, fastingActive }: BottomNavProps) {
  return (
    <nav
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50 flex-shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = current === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative',
                isActive
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <div className="relative">
                <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.5]')} />
                {id === 'timer' && fastingActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className={clsx('text-xs font-medium', isActive ? 'opacity-100' : 'opacity-70')}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
