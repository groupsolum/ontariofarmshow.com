export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export const MAP_STYLE = "mapbox://styles/mapbox/light-v11";

export const ONTARIO_CENTER = {
  longitude: -80.0,
  latitude: 44.0,
} as const;

export const ONTARIO_DEFAULT_ZOOM = 5.5;

export const ONTARIO_MAX_BOUNDS: [number, number, number, number] = [
  -95.2, 41.7, -74.3, 56.9,
];
