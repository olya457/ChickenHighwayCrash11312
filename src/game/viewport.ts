export const VISIBLE_ROWS = 7;
export function rowTop(row: number, camera: number, rowHeight: number) {
  return (VISIBLE_ROWS - 1 - row + camera) * rowHeight;
}
export function visibleRows(camera: number) {
  const first = Math.floor(camera);
  return Array.from({ length: VISIBLE_ROWS + 1 }, (_, index) => first + index);
}
export function roadTiles(camera: number, rowHeight: number) {
  const first = Math.floor(camera / VISIBLE_ROWS);
  return [first, first + 1].map(id => ({
    id,
    top: (camera - id * VISIBLE_ROWS) * rowHeight,
  }));
}
