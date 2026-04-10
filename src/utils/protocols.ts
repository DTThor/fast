import type { FastingProtocol } from '../types';

export const FASTING_PROTOCOLS: FastingProtocol[] = [
  {
    id: '16:8',
    name: '16:8',
    fastHours: 16,
    eatHours: 8,
    description: 'Fast 16 hours, eat within an 8-hour window. The most popular protocol.',
    difficulty: 'beginner',
  },
  {
    id: '18:6',
    name: '18:6',
    fastHours: 18,
    eatHours: 6,
    description: 'Fast 18 hours, eat within a 6-hour window. Great for deeper ketosis.',
    difficulty: 'intermediate',
  },
  {
    id: '20:4',
    name: '20:4 (Warrior)',
    fastHours: 20,
    eatHours: 4,
    description: 'Fast 20 hours, eat within a 4-hour window. Warrior Diet protocol.',
    difficulty: 'intermediate',
  },
  {
    id: 'OMAD',
    name: 'OMAD',
    fastHours: 23,
    eatHours: 1,
    description: 'One Meal A Day. Fast 23 hours and eat one large meal.',
    difficulty: 'advanced',
  },
  {
    id: '5:2',
    name: '5:2',
    fastHours: 36,
    eatHours: 12,
    description: 'Eat normally 5 days/week, restrict calories to 500 on 2 days.',
    difficulty: 'intermediate',
  },
  {
    id: '36h',
    name: '36-Hour Fast',
    fastHours: 36,
    eatHours: 12,
    description: 'Extended 36-hour fast for deeper autophagy and cellular regeneration.',
    difficulty: 'advanced',
  },
  {
    id: '48h',
    name: '48-Hour Fast',
    fastHours: 48,
    eatHours: 24,
    description: 'Two-day extended fast for maximum autophagy benefits.',
    difficulty: 'advanced',
  },
  {
    id: 'custom',
    name: 'Custom',
    fastHours: 16,
    eatHours: 8,
    description: 'Set your own fasting duration.',
    difficulty: 'beginner',
  },
];

export const getProtocol = (id: string): FastingProtocol =>
  FASTING_PROTOCOLS.find((p) => p.id === id) ?? FASTING_PROTOCOLS[0];
