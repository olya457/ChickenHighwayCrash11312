import { activate, createGame, move, tick, summary } from '../src/game/engine';
import {
  initialProgress,
  parseProgress,
  progressReducer,
  RunSummary,
} from '../src/state/progress';
const run = (overrides: Partial<RunSummary> = {}): RunSummary => ({
  id: 'run-1',
  rows: 25,
  eggies: 400,
  baseReward: 400,
  multiplier: 2.44,
  cleanRows: 25,
  moving: 10,
  ...overrides,
});
test('starts with no demo currency or premium inventory', () => {
  const state = initialProgress();
  expect(state.eggies).toBe(0);
  expect(state.chickens).toEqual(['classic']);
  expect(state.boosts).toEqual({ shield: 0, slow: 0, rush: 0 });
});
test('awards all five challenges and exclusive skins exactly once', () => {
  const state = progressReducer(initialProgress(), { type: 'run', run: run() });
  expect(state.eggies).toBe(14400);
  expect(state.completed).toHaveLength(5);
  expect(state.chickens).toEqual(
    expect.arrayContaining(['racer', 'cowboy', 'boss']),
  );
  expect(state.highways).toContain('mountain');
  expect(progressReducer(state, { type: 'run', run: run() })).toEqual(state);
});
test('checkpoints only credit the additional gameplay reward', () => {
  let state = progressReducer(initialProgress(), {
    type: 'run',
    run: run({ rows: 1, eggies: 10, cleanRows: 1, moving: 1 }),
  });
  state = progressReducer(state, {
    type: 'run',
    run: run({ rows: 2, eggies: 22, cleanRows: 2, moving: 2 }),
  });
  expect(state.eggies).toBe(22);
});
test('a shield collision prevents clean-run challenge progress', () => {
  const state = progressReducer(initialProgress(), {
    type: 'run',
    run: run({ cleanRows: 9, moving: 2 }),
  });
  expect(state.completed).toEqual(['long']);
  expect(state.chickens).not.toContain('cowboy');
});
test('purchases charge the exact amount and refuse insufficient funds', () => {
  const empty = initialProgress();
  expect(progressReducer(empty, { type: 'buyBoost', id: 'shield' })).toBe(
    empty,
  );
  const rich = { ...empty, eggies: 1500 };
  const bought = progressReducer(rich, { type: 'buyBoost', id: 'shield' });
  expect(bought.eggies).toBe(800);
  expect(bought.boosts.shield).toBe(1);
  const used = progressReducer(bought, { type: 'consume', id: 'shield' });
  expect(used.boosts.shield).toBe(0);
  expect(progressReducer(used, { type: 'consume', id: 'shield' })).toBe(used);
});
test('Cowboy cannot be purchased even with sufficient Eggies', () => {
  const state = { ...initialProgress(), eggies: 10000 };
  expect(progressReducer(state, { type: 'chicken', id: 'cowboy' })).toBe(state);
});
test('owned skins can be equipped without paying twice', () => {
  const first = progressReducer(
    { ...initialProgress(), eggies: 500 },
    { type: 'chicken', id: 'highway' },
  );
  const classic = progressReducer(first, { type: 'chicken', id: 'classic' });
  const equipped = progressReducer(classic, { type: 'chicken', id: 'highway' });
  expect(equipped.eggies).toBe(0);
  expect(equipped.chicken).toBe('highway');
});
test('progress round trips and reset removes all earned content', () => {
  const state = progressReducer(initialProgress(), { type: 'run', run: run() });
  expect(parseProgress(JSON.stringify(state))).toEqual(state);
  expect(progressReducer(state, { type: 'reset' })).toEqual(initialProgress());
  expect(() => parseProgress('{')).toThrow();
});
test('collision ends a run unless a shield is active', () => {
  const game = createGame(390);
  game.row = 1;
  game.lanes[0].cars = [{ type: 0, direction: 1, x: 170 }];
  activate(game, 'shield');
  tick(game, 0.01, 390);
  expect(game.crashed).toBe(false);
  expect(game.shield).toBe(false);
  expect(game.collided).toBe(true);
  game.invincibleUntil = 0;
  tick(game, 0.01, 390);
  expect(game.crashed).toBe(true);
});
test('returning and crossing the same row never grants another reward', () => {
  const game = createGame(390);
  game.lanes.forEach(l => {
    l.cars = [];
  });
  move(game, 1, 390);
  tick(game, 0.21, 390);
  const earned = game.eggies;
  move(game, -1, 390);
  tick(game, 0.21, 390);
  move(game, 1, 390);
  tick(game, 0.21, 390);
  expect(game.eggies).toBe(earned);
  expect(game.furthest).toBe(1);
  expect(summary(game).rows).toBe(1);
});
test('Traffic Slow expires and Egg Rush adds exactly 50 percent', () => {
  const game = createGame(390);
  const ordinary = createGame(390);
  game.lanes[0].cars = [{ type: 0, direction: 1, x: 0 }];
  ordinary.lanes[0].cars = [{ type: 0, direction: 1, x: 0 }];
  activate(game, 'slow');
  tick(game, 1, 390);
  tick(ordinary, 1, 390);
  expect(game.lanes[0].cars[0].x).toBeCloseTo(
    ordinary.lanes[0].cars[0].x * 0.35,
  );
  game.baseReward = 100;
  expect(activate(game, 'rush')).toBe(true);
  expect(game.eggies).toBe(150);
  expect(activate(game, 'rush')).toBe(false);
  game.time = 9;
  const before = game.lanes[0].cars[0].x;
  tick(game, 1, 390);
  expect(game.lanes[0].cars[0].x - before).toBeCloseTo(64);
});
test('Keep Moving resets its streak after a long pause', () => {
  const game = createGame(390);
  game.lanes.forEach(l => {
    l.cars = [];
  });
  move(game, 1, 390);
  tick(game, 0.21, 390);
  tick(game, 3, 390);
  move(game, 1, 390);
  tick(game, 0.21, 390);
  expect(game.streak).toBe(1);
  expect(game.moving).toBe(1);
});
