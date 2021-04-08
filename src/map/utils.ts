export const pairWise = function* <T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; i = i + 2) {
    yield arr.slice(i, i + 2) as [T, T];
  }
};

export const pairWiseArray = <T>(arr: T[]): [T, T][] => [...pairWise(arr)];

export const bound = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const manhatten = (p1: [number, number], p2: [number, number]): number =>
  Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);

export const pointClosestTo = (
  points: [number, number][],
  target: [number, number]
): [number, number] =>
  points.reduce(
    (prev, cur) =>
      manhatten(cur, target) < manhatten(prev, target) ? cur : prev,
    points[0]
  );
