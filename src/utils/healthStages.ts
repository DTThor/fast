import type { HealthStage } from '../types';

export const HEALTH_STAGES: HealthStage[] = [
  {
    hour: 0,
    title: 'Fed State',
    description: 'Digestion active. Insulin levels elevated. Body burning glucose.',
    icon: '🍽️',
    color: '#94a3b8',
  },
  {
    hour: 4,
    title: 'Early Fasting',
    description: 'Blood sugar normalizing. Liver glycogen being used for energy.',
    icon: '⚡',
    color: '#60a5fa',
  },
  {
    hour: 8,
    title: 'Glycogen Depletion',
    description: 'Liver glycogen nearly depleted. Body beginning to mobilize fat stores.',
    icon: '🔥',
    color: '#f59e0b',
  },
  {
    hour: 12,
    title: 'Fat Burning Begins',
    description: 'Ketone production starting. Growth hormone levels rising significantly.',
    icon: '💪',
    color: '#34d399',
  },
  {
    hour: 16,
    title: 'Ketosis Entering',
    description: 'Ketone levels measurable. Insulin at its lowest. Significant fat oxidation.',
    icon: '🧬',
    color: '#a78bfa',
  },
  {
    hour: 18,
    title: 'Deep Ketosis',
    description: 'Brain running efficiently on ketones. Mental clarity often reported.',
    icon: '🧠',
    color: '#818cf8',
  },
  {
    hour: 24,
    title: 'Autophagy Active',
    description: 'Cellular cleanup accelerating. Damaged cells being recycled and renewed.',
    icon: '♻️',
    color: '#f472b6',
  },
  {
    hour: 36,
    title: 'Peak Autophagy',
    description: 'Maximum cellular regeneration. Immune system reset beginning.',
    icon: '🌟',
    color: '#fb923c',
  },
  {
    hour: 48,
    title: 'Immune Reset',
    description: 'Immune stem cells regenerating. Profound metabolic adaptations occurring.',
    icon: '🛡️',
    color: '#e879f9',
  },
  {
    hour: 72,
    title: 'Extended Benefits',
    description: 'Gut microbiome reset. Insulin sensitivity greatly improved.',
    icon: '🏆',
    color: '#22d3ee',
  },
];

export function getCurrentStage(elapsedHours: number): HealthStage {
  let current = HEALTH_STAGES[0];
  for (const stage of HEALTH_STAGES) {
    if (elapsedHours >= stage.hour) {
      current = stage;
    } else {
      break;
    }
  }
  return current;
}

export function getNextStage(elapsedHours: number): HealthStage | null {
  for (const stage of HEALTH_STAGES) {
    if (stage.hour > elapsedHours) return stage;
  }
  return null;
}
