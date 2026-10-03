import { createGame, move, tick } from '../src/game/engine';
import {
  roadTiles,
  rowTop,
  visibleRows,
  VISIBLE_ROWS,
} from '../src/game/viewport';
function advance(game: ReturnType<typeof createGame>, direction: 1 | -1 = 1) {
  move(game, direction, 390);
  game.lanes.forEach(lane => {
    lane.cars = [];
  });
  for (let frame = 0; frame < 30; frame++) {
    tick(game, 1 / 60, 390);
  }
}
test('crosses beyond row five and keeps generating traffic for an endless run', () => {
  const game = createGame(390);
  for (let row = 1; row <= 300; row++) {
    const previousLastRow = game.lanes.at(-1)!.row;
    move(game, 1, 390);
    expect(game.row).toBe(row);
    expect(game.lanes.at(-1)!.row).toBeGreaterThanOrEqual(row + 8);
    game.lanes
      .filter(lane => lane.row > previousLastRow)
      .forEach(lane => {
        expect(lane.cars.length).toBeGreaterThan(0);
      });
    game.lanes.forEach(lane => {
      lane.cars = [];
    });
    for (let frame = 0; frame < 30; frame++) {
      tick(game, 1 / 60, 390);
    }
    expect(game.crashed).toBe(false);
    expect(game.furthest).toBe(row);
    expect(game.camera).toBeCloseTo(Math.max(0, row - 3));
    expect(visibleRows(game.camera)).toContain(row);
    expect(game.lanes.length).toBeLessThanOrEqual(15);
  }
  expect(game.eggies).toBeGreaterThan(3000);
});
test('camera moves the road and traffic gradually down after crossing the fourth row', () => {
  const game = createGame(390);
  for (let row = 0; row < 3; row++) {
    advance(game);
  }
  move(game, 1, 390);
  game.lanes.forEach(lane => {
    lane.cars = [];
  });
  for (let frame = 0; frame < 12; frame++) {
    tick(game, 1 / 60, 390);
  }
  expect(game.camera).toBeGreaterThan(0);
  expect(game.camera).toBeLessThan(1);
  const before = rowTop(5, game.camera, 80);
  tick(game, 1 / 60, 390);
  expect(rowTop(5, game.camera, 80)).toBeGreaterThan(before);
});
test('road tiles cover the entire board without a gap across repeated sections', () => {
  const height = 560;
  for (const camera of [0, 0.5, 6.99, 7, 7.01, 50.7, 299.5]) {
    const tiles = roadTiles(camera, height / VISIBLE_ROWS).sort(
      (a, b) => a.top - b.top,
    );
    expect(tiles[0].top).toBeLessThanOrEqual(0);
    expect(tiles[0].top + height).toBeCloseTo(tiles[1].top);
    expect(tiles[1].top + height).toBeGreaterThanOrEqual(height);
    const rows = visibleRows(camera);
    expect(rowTop(rows[0], camera, 80) + 80).toBeGreaterThanOrEqual(height);
    expect(rowTop(rows.at(-1)!, camera, 80)).toBeLessThanOrEqual(0);
  }
});
test('returning after scrolling keeps the chicken visible and does not repeat rewards', () => {
  const game = createGame(390);
  for (let row = 0; row < 20; row++) {
    advance(game);
  }
  const earned = game.eggies;
  const camera = game.camera;
  for (let row = 0; row < 3; row++) {
    advance(game, -1);
  }
  expect(game.row).toBe(17);
  expect(rowTop(game.row, game.camera, 80)).toBe(480);
  advance(game, -1);
  expect(game.row).toBe(17);
  for (let row = 0; row < 3; row++) {
    advance(game);
  }
  expect(game.camera).toBe(camera);
  expect(game.eggies).toBe(earned);
  advance(game);
  expect(game.furthest).toBe(21);
  expect(game.camera).toBe(camera + 1);
});

test('camera keeps up with repeated fast crossings', () => {
  const game = createGame(390);
  for (let row = 1; row <= 100; row++) {
    move(game, 1, 390);
    game.lanes.forEach(lane => {
      lane.cars = [];
    });
    for (let frame = 0; frame < 13; frame++) {
      tick(game, 1 / 60, 390);
    }
    expect(game.row).toBe(row);
    expect(game.furthest).toBe(row);
    expect(Math.max(0, game.furthest - 3) - game.camera).toBeLessThan(1);
    expect(visibleRows(game.camera)).toContain(game.row);
  }
});
