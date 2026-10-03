import { vehicles, BoostId } from '../data/catalog';
import { RunSummary } from '../state/progress';
export type Car = { x: number; type: number; direction: 1 | -1 };
export type Lane = { row: number; cars: Car[] };
export type Game = {
  id: string;
  row: number;
  camera: number;
  furthest: number;
  time: number;
  lanes: Lane[];
  baseReward: number;
  eggies: number;
  multiplier: number;
  shield: boolean;
  slowUntil: number;
  rush: boolean;
  invincibleUntil: number;
  crashed: boolean;
  cleanRows: number;
  collided: boolean;
  moving: number;
  streak: number;
  lastCross: number;
  lastMove: number;
  hop: number;
  shieldBroken: number;
};
export const multiplierFor = (rows: number) =>
  Math.round((1 + rows * 0.02 + rows * rows * 0.0015) * 100) / 100;
function lane(row: number, width: number): Lane {
  const type = (row - 1) % 5;
  const direction: 1 | -1 = row % 2 === 0 ? 1 : -1;
  const count = row > 18 ? 3 : 2;
  return {
    row,
    cars: Array.from({ length: count }, (_, i) => ({
      type,
      direction,
      x: (i / count) * (width + 240) - 120 + Math.random() * 65,
    })),
  };
}
export function createGame(width: number): Game {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    row: 0,
    camera: 0,
    furthest: 0,
    time: 0,
    lanes: Array.from({ length: 10 }, (_, i) => lane(i + 1, width)),
    baseReward: 0,
    eggies: 0,
    multiplier: 1,
    shield: false,
    slowUntil: 0,
    rush: false,
    invincibleUntil: 0,
    crashed: false,
    cleanRows: 0,
    collided: false,
    moving: 0,
    streak: 0,
    lastCross: 0,
    lastMove: -1,
    hop: 0,
    shieldBroken: 0,
  };
}
export function activate(game: Game, id: BoostId): boolean {
  if (game.crashed) {
    return false;
  }
  if (id === 'shield') {
    if (game.shield) {
      return false;
    }
    game.shield = true;
  }
  if (id === 'slow') {
    if (game.slowUntil > game.time) {
      return false;
    }
    game.slowUntil = game.time + 8;
  }
  if (id === 'rush') {
    if (game.rush) {
      return false;
    }
    game.rush = true;
    game.eggies = Math.floor(game.baseReward * 1.5);
  }
  return true;
}
export function move(game: Game, direction: 1 | -1, width: number) {
  if (game.crashed || game.time - game.lastMove < 0.2) {
    return;
  }
  const target = game.row + direction;
  if (target < Math.max(0, game.furthest - 3)) {
    return;
  }
  game.row = target;
  game.lastMove = game.time;
  game.hop = 0.18;
  while (game.lanes[game.lanes.length - 1].row < game.row + 8) {
    game.lanes.push(lane(game.lanes[game.lanes.length - 1].row + 1, width));
  }
  game.lanes = game.lanes.filter(l => l.row >= game.furthest - 5);
}
function collision(game: Game, width: number) {
  const current = game.lanes.find(l => l.row === game.row);
  if (!current || game.time < game.invincibleUntil) {
    return;
  }
  const hit = current.cars.some(c => {
    const carWidth = vehicles[c.type].width;
    return (
      c.x + carWidth * 0.84 > width / 2 - 11 &&
      c.x + carWidth * 0.16 < width / 2 + 11
    );
  });
  if (hit) {
    game.collided = true;
    game.streak = 0;
    if (game.shield) {
      game.shield = false;
      game.shieldBroken = game.time;
      game.invincibleUntil = game.time + 1.5;
    } else {
      game.crashed = true;
    }
  }
}
export function tick(game: Game, dt: number, width: number) {
  if (game.crashed) {
    return;
  }
  game.time += dt;
  game.hop = Math.max(0, game.hop - dt);
  const difficulty = 1 + Math.min(game.furthest * 0.022, 1.8);
  const slow = game.slowUntil > game.time ? 0.35 : 1;
  for (const l of game.lanes) {
    for (const c of l.cars) {
      const v = vehicles[c.type];
      c.x += c.direction * v.speed * difficulty * slow * dt;
      if (c.x > width + 160) {
        c.x = -v.width - 120;
      }
      if (c.x < -v.width - 160) {
        c.x = width + 120;
      }
    }
  }
  collision(game, width);
  if (!game.crashed && game.hop === 0 && game.row > game.furthest) {
    game.furthest = game.row;
    game.multiplier = multiplierFor(game.furthest);
    game.baseReward += Math.round(10 * game.multiplier);
    game.eggies = Math.floor(game.baseReward * (game.rush ? 1.5 : 1));
    if (!game.collided) {
      game.cleanRows = game.furthest;
    }
    game.streak =
      game.lastCross === 0 || game.time - game.lastCross <= 2
        ? game.streak + 1
        : 1;
    game.moving = Math.max(game.moving, game.streak);
    game.lastCross = game.time;
  }
  if (!game.crashed) {
    const target = Math.max(0, game.furthest - 3);
    game.camera = Math.min(target, game.camera + dt / 0.18);
  }
}
export function summary(game: Game): RunSummary {
  return {
    id: game.id,
    rows: game.furthest,
    eggies: game.eggies,
    baseReward: game.baseReward,
    multiplier: game.multiplier,
    cleanRows: game.cleanRows,
    moving: game.moving,
  };
}
