import {
  BoostId,
  ChallengeId,
  ChickenId,
  HighwayId,
  boosts,
  challenges,
  chickens,
  highways,
} from '../data/catalog';
export type RunSummary = {
  id: string;
  rows: number;
  eggies: number;
  baseReward: number;
  multiplier: number;
  cleanRows: number;
  moving: number;
};
export type Progress = {
  version: 1;
  onboarded: boolean;
  eggies: number;
  chickens: ChickenId[];
  highways: HighwayId[];
  chicken: ChickenId;
  highway: HighwayId;
  boosts: Record<BoostId, number>;
  challengeProgress: Record<ChallengeId, number>;
  completed: ChallengeId[];
  bestRows: number;
  bestScore: number;
  bestMultiplier: number;
  sound: boolean;
  vibration: boolean;
  lastRun: string;
  lastRunEggies: number;
};
export const initialProgress = (): Progress => ({
  version: 1,
  onboarded: false,
  eggies: 0,
  chickens: ['classic'],
  highways: ['classic'],
  chicken: 'classic',
  highway: 'classic',
  boosts: { shield: 0, slow: 0, rush: 0 },
  challengeProgress: { long: 0, hero: 0, moving: 0, perfect: 0, master: 0 },
  completed: [],
  bestRows: 0,
  bestScore: 0,
  bestMultiplier: 1,
  sound: true,
  vibration: true,
  lastRun: '',
  lastRunEggies: 0,
});
export type Action =
  | { type: 'onboard' }
  | { type: 'setting'; key: 'sound' | 'vibration'; value: boolean }
  | { type: 'buyBoost'; id: BoostId }
  | { type: 'consume'; id: BoostId }
  | { type: 'chicken'; id: ChickenId }
  | { type: 'highway'; id: HighwayId }
  | { type: 'run'; run: RunSummary }
  | { type: 'reset' };
export function progressReducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case 'reset':
      return initialProgress();
    case 'onboard':
      return { ...state, onboarded: true };
    case 'setting':
      return { ...state, [action.key]: action.value };
    case 'buyBoost': {
      const item = boosts.find(b => b.id === action.id)!;
      return state.eggies < item.price
        ? state
        : {
            ...state,
            eggies: state.eggies - item.price,
            boosts: { ...state.boosts, [item.id]: state.boosts[item.id] + 1 },
          };
    }
    case 'consume':
      return state.boosts[action.id] < 1
        ? state
        : {
            ...state,
            boosts: {
              ...state.boosts,
              [action.id]: state.boosts[action.id] - 1,
            },
          };
    case 'chicken': {
      const item = chickens.find(s => s.id === action.id)!;
      if (state.chickens.includes(item.id)) {
        return { ...state, chicken: item.id };
      }
      if (item.price === undefined || state.eggies < item.price) {
        return state;
      }
      return {
        ...state,
        eggies: state.eggies - item.price,
        chickens: [...state.chickens, item.id],
        chicken: item.id,
      };
    }
    case 'highway': {
      const item = highways.find(s => s.id === action.id)!;
      if (state.highways.includes(item.id)) {
        return { ...state, highway: item.id };
      }
      if (item.price === undefined || state.eggies < item.price) {
        return state;
      }
      return {
        ...state,
        eggies: state.eggies - item.price,
        highways: [...state.highways, item.id],
        highway: item.id,
      };
    }
    case 'run': {
      const r = action.run;
      const awarded = state.lastRun === r.id ? state.lastRunEggies : 0;
      const next: Progress = {
        ...state,
        lastRun: r.id,
        lastRunEggies: r.eggies,
        eggies: state.eggies + Math.max(0, r.eggies - awarded),
        bestRows: Math.max(state.bestRows, r.rows),
        bestScore: Math.max(state.bestScore, r.eggies),
        bestMultiplier: Math.max(state.bestMultiplier, r.multiplier),
        challengeProgress: { ...state.challengeProgress },
        completed: [...state.completed],
        chickens: [...state.chickens],
        highways: [...state.highways],
      };
      const values = {
        long: r.rows,
        hero: r.cleanRows,
        moving: r.moving,
        perfect: r.cleanRows,
        master: r.cleanRows,
      };
      challenges.forEach(c => {
        next.challengeProgress[c.id] = Math.min(
          c.target,
          Math.max(next.challengeProgress[c.id], values[c.id]),
        );
        if (
          next.challengeProgress[c.id] >= c.target &&
          !next.completed.includes(c.id)
        ) {
          next.completed.push(c.id);
          next.eggies += c.reward;
        }
      });
      if (
        next.completed.includes('hero') &&
        !next.chickens.includes('cowboy')
      ) {
        next.chickens.push('cowboy');
      }
      if (
        next.completed.includes('master') &&
        !next.chickens.includes('racer')
      ) {
        next.chickens.push('racer');
      }
      if (next.completed.length === 5) {
        if (!next.chickens.includes('boss')) {
          next.chickens.push('boss');
        }
        if (!next.highways.includes('mountain')) {
          next.highways.push('mountain');
        }
      }
      return next;
    }
  }
}
export function parseProgress(raw: string | null): Progress {
  if (!raw) {
    return initialProgress();
  }
  const p = JSON.parse(raw);
  const base = initialProgress();
  if (p.version !== 1 || !Number.isSafeInteger(p.eggies) || p.eggies < 0) {
    throw new Error('Invalid save');
  }
  const next = {
    ...base,
    ...p,
    boosts: { ...base.boosts, ...p.boosts },
    challengeProgress: { ...base.challengeProgress, ...p.challengeProgress },
  } as Progress;
  if (
    !Array.isArray(next.chickens) ||
    !Array.isArray(next.highways) ||
    !Array.isArray(next.completed) ||
    !next.chickens.includes(next.chicken) ||
    !next.highways.includes(next.highway) ||
    !chickens.some(s => s.id === next.chicken) ||
    !highways.some(s => s.id === next.highway) ||
    Object.values(next.boosts).some(n => !Number.isSafeInteger(n) || n < 0)
  ) {
    throw new Error('Invalid save');
  }
  return next;
}
