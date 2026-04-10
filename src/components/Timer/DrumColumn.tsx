import { useRef, useEffect } from 'react';

interface DrumColumnProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
}

const ITEM_HEIGHT = 44;
const VISIBLE = 5;

export default function DrumColumn({ items, selectedIndex, onChange, width = 64 }: DrumColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const settling = useRef(false);
  const height = ITEM_HEIGHT * VISIBLE;
  const pad = (height - ITEM_HEIGHT) / 2;

  // Scroll to a given index
  function scrollTo(index: number, smooth = false) {
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: smooth ? 'smooth' : 'instant' });
  }

  // On mount, jump to initial position
  useEffect(() => {
    scrollTo(selectedIndex);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If parent changes selectedIndex externally, sync
  useEffect(() => {
    if (!settling.current) scrollTo(selectedIndex);
  }, [selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect scroll end, snap, and report new index
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;

    function onScroll() {
      settling.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!el) return;
        const raw = Math.round(el.scrollTop / ITEM_HEIGHT);
        const index = Math.max(0, Math.min(raw, items.length - 1));
        scrollTo(index, true);
        settling.current = false;
        onChange(index);
      }, 120);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, [items.length, onChange]);

  return (
    <div className="relative flex-shrink-0" style={{ width, height }}>
      {/* Selection band */}
      <div
        className="absolute inset-x-0 pointer-events-none z-10 rounded-xl bg-slate-100 dark:bg-slate-700/70"
        style={{ top: pad, height: ITEM_HEIGHT }}
      />
      {/* Top + bottom fade masks */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-20"
        style={{
          height: pad,
          background: 'linear-gradient(to bottom, var(--drum-mask, white) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-20"
        style={{
          height: pad,
          background: 'linear-gradient(to top, var(--drum-mask, white) 0%, transparent 100%)',
        }}
      />
      {/* Scrollable list */}
      <div
        ref={ref}
        className="absolute inset-0 overflow-y-scroll scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div style={{ paddingTop: pad, paddingBottom: pad }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
              className={`flex items-center justify-center font-medium select-none transition-all duration-100 cursor-pointer ${
                i === selectedIndex
                  ? 'text-slate-900 dark:text-white text-base font-semibold'
                  : Math.abs(i - selectedIndex) === 1
                  ? 'text-slate-400 dark:text-slate-500 text-sm'
                  : 'text-slate-300 dark:text-slate-600 text-xs'
              }`}
              onClick={() => { scrollTo(i, true); onChange(i); }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
