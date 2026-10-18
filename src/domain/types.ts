export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Verification = "fixture" | "unverified" | "community" | "verified";

export type Source = {
  id: string;
  kind: "fixture" | "manual" | "osm" | "owner";
  title: string;
  url: string | null;
  retrievedAt: string;
  license: string | null;
};

export type Sourced<T> = {
  value: T;
  sourceId: string;
  verification: Verification;
};

export type Address = {
  lines: string[];
  city: "Makati";
  country: "PH";
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PriceRange = 1 | 2 | 3 | 4;

export type Amenity =
  | "wifi"
  | "power_outlets"
  | "outdoor_seating"
  | "air_conditioning"
  | "work_friendly"
  | "food"
  | "decaf";

export type WeeklyHours = {
  periods: {
    day: Day;
    opens: string;
    closes: string;
  }[];
};

export type MenuItem = {
  id: string;
  name: string;
  category: string | null;
  price: {
    amount: number;
    currency: "PHP";
  } | null;
  sourceId: string;
  verification: Verification;
};

export type Photo = {
  id: string;
  url: string;
  alt: string;
  attribution: string;
  license: string;
  sourceId: string;
  verification: Verification;
};

export type Cafe = {
  id: string;
  slug: string;
  name: string;
  nameSourceId: string;
  verification: Verification;
  neighborhood: string | null;
  address: Sourced<Address> | null;
  location: Sourced<Coordinates> | null;
  hours: Sourced<WeeklyHours> | null;
  amenities: Sourced<Amenity[]> | null;
  priceRange: Sourced<PriceRange> | null;
  menu: MenuItem[];
  photos: Photo[];
  sources: Source[];
};

export type Favorite = {
  cafeId: string;
  savedAt: string;
};

export type BucketItem = {
  cafeId: string;
  addedAt: string;
};

export type Visit = {
  id: string;
  cafeId: string;
  visitedAt: string;
  recordedAt: string;
  method: "self_reported";
};

export type LocationFix = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  at: string;
};
