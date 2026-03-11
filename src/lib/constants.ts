export const ONTARIO_REGIONS = [
  {
    value: "eastern",
    label: "Eastern Ontario",
    cities: ["Ottawa", "Kingston", "Cornwall", "Brockville"],
  },
  {
    value: "western",
    label: "Western Ontario",
    cities: ["London", "Windsor", "Sarnia", "Chatham-Kent", "Chatham"],
  },
  {
    value: "central",
    label: "Central Ontario",
    cities: ["Barrie", "Orillia", "Peterborough", "Kawartha Lakes", "Lindsay"],
  },
  {
    value: "northern",
    label: "Northern Ontario",
    cities: ["Sudbury", "Thunder Bay", "Sault Ste. Marie", "North Bay"],
  },
  {
    value: "southern",
    label: "Southern Ontario",
    cities: [
      "Hamilton",
      "Niagara Falls",
      "St. Catharines",
      "Brantford",
      "Simcoe",
    ],
  },
  {
    value: "gta",
    label: "Greater Toronto Area",
    cities: ["Toronto", "Mississauga", "Brampton", "Markham", "Vaughan"],
  },
  {
    value: "southwestern",
    label: "Southwestern Ontario",
    cities: [
      "Kitchener",
      "Waterloo",
      "Guelph",
      "Cambridge",
      "Stratford",
      "Woodstock",
      "Elora",
      "Fergus",
      "Rockton",
    ],
  },
] as const;

export const EVENT_TYPES = [
  { value: "farm_show", label: "Farm Show" },
  { value: "agricultural_fair", label: "Agricultural Fair" },
  { value: "livestock_show", label: "Livestock Show" },
  { value: "equipment_expo", label: "Equipment Expo" },
  { value: "crop_show", label: "Crop & Seed Show" },
  { value: "dairy_expo", label: "Dairy Expo" },
  { value: "conference", label: "Agricultural Conference" },
  { value: "other", label: "Other" },
] as const;

export const VENUE_TYPES = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "mixed", label: "Indoor & Outdoor" },
] as const;

export const EVENT_FEATURES = [
  { value: "parking", label: "Free Parking" },
  { value: "food_vendors", label: "Food Vendors" },
  { value: "kids_activities", label: "Kids' Activities" },
  { value: "accessible", label: "Wheelchair Accessible" },
  { value: "livestock", label: "Live Animals" },
  { value: "demonstrations", label: "Live Demonstrations" },
  { value: "competitions", label: "Competitions" },
  { value: "auctions", label: "Auctions" },
  { value: "entertainment", label: "Live Entertainment" },
  { value: "midway", label: "Midway / Rides" },
] as const;

export type RegionValue = (typeof ONTARIO_REGIONS)[number]["value"];
export type EventTypeValue = (typeof EVENT_TYPES)[number]["value"];
export type VenueTypeValue = (typeof VENUE_TYPES)[number]["value"];
export type FeatureValue = (typeof EVENT_FEATURES)[number]["value"];

export const ONTARIO_CENTER = { lat: 44.0, lng: -80.0 } as const;
export const ONTARIO_DEFAULT_ZOOM = 6;
export const ONTARIO_BOUNDS: [[number, number], [number, number]] = [
  [-95.2, 41.7],
  [-74.3, 56.9],
];
