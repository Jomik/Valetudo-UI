export const pairWise = function* <T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; i = i + 2) {
    yield arr.slice(i, i + 2) as [T, T];
  }
};

export const pairWiseArray = <T>(arr: T[]): [T, T][] => [...pairWise(arr)];

export const bound = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
