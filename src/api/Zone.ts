type Point = {
  x: number;
  y: number;
};

export interface Zone {
  points: {
    pA: Point;
    pB: Point;
    pC: Point;
    pD: Point;
  };
  iterations: number;
}

export interface ZonePreset {
  id: string;
  name: string;
  zones: Zone[];
}
