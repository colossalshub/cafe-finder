import type { Cafe, Day, Source, Sourced, WeeklyHours } from "../domain/types";

const demoSource: Source = {
  id: "src-demo",
  kind: "fixture",
  title: "Demonstration record",
  url: null,
  retrievedAt: "2026-10-18T00:00:00+08:00",
  license: "Demonstration only. Not a real-world source.",
};

function demo<T>(value: T): Sourced<T> {
  return {
    value,
    sourceId: demoSource.id,
    verification: "fixture",
  };
}

function week(opens: string, closes: string): WeeklyHours {
  const days: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return {
    periods: days.map((day) => ({ day, opens, closes })),
  };
}

function cafe(
  id: string,
  slug: string,
  name: string,
  fields: Partial<Cafe> = {},
): Cafe {
  return {
    id,
    slug,
    name,
    nameSourceId: demoSource.id,
    verification: "fixture",
    neighborhood: null,
    address: null,
    location: null,
    hours: null,
    amenities: null,
    priceRange: null,
    menu: [],
    photos: [],
    sources: [demoSource],
    ...fields,
  };
}

export const fixtureCafes: Cafe[] = [
  cafe("demo-north-margin", "north-margin", "North Margin", {
    neighborhood: "Legazpi",
    address: demo({
      lines: ["14 Sample Lane"],
      city: "Makati",
      country: "PH",
    }),
    location: demo({ latitude: 14.554, longitude: 121.024 }),
    hours: demo(week("08:00", "17:00")),
    amenities: demo(["wifi", "power_outlets", "work_friendly"]),
    priceRange: demo(2),
    menu: [
      {
        id: "demo-north-margin-espresso",
        name: "Espresso",
        category: "Coffee",
        price: { amount: 90, currency: "PHP" },
        sourceId: demoSource.id,
        verification: "fixture",
      },
      {
        id: "demo-north-margin-milk",
        name: "Milk coffee",
        category: "Coffee",
        price: { amount: 140, currency: "PHP" },
        sourceId: demoSource.id,
        verification: "fixture",
      },
    ],
  }),
  cafe("demo-folded-page", "folded-page", "Folded Page", {
    neighborhood: "Salcedo",
    address: demo({
      lines: ["8 Quiet Street"],
      city: "Makati",
      country: "PH",
    }),
    location: demo({ latitude: 14.559, longitude: 121.022 }),
    amenities: demo(["wifi"]),
  }),
  cafe("demo-late-afternoon", "late-afternoon", "Late Afternoon", {
    neighborhood: "Poblacion",
    address: demo({
      lines: ["3 Evening Road"],
      city: "Makati",
      country: "PH",
    }),
    location: demo({ latitude: 14.565, longitude: 121.03 }),
    hours: demo(week("16:00", "23:00")),
  }),
  cafe("demo-second-copy", "second-copy", "Second Copy", {
    neighborhood: "Century City",
    address: demo({
      lines: ["21 Reading Court"],
      city: "Makati",
      country: "PH",
    }),
    location: demo({ latitude: 14.573, longitude: 121.028 }),
    amenities: demo(["food"]),
    menu: [
      {
        id: "demo-second-copy-filter",
        name: "Filter coffee",
        category: "Coffee",
        price: null,
        sourceId: demoSource.id,
        verification: "fixture",
      },
    ],
  }),
  cafe("demo-blank-entry", "blank-entry", "Blank Entry"),
  cafe("demo-low-table", "low-table", "Low Table", {
    neighborhood: "Rockwell",
    address: demo({
      lines: ["5 Low Street"],
      city: "Makati",
      country: "PH",
    }),
    location: demo({ latitude: 14.564, longitude: 121.036 }),
    amenities: demo(["outdoor_seating"]),
  }),
];
