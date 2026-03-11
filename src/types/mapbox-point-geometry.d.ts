// Fix for missing index.d.ts in @types/mapbox__point-geometry stub package
declare module "@mapbox/point-geometry" {
  class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
  }
  export = Point;
}
