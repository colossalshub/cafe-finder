export function personalStatusLine(input: {
  saved: boolean;
  onBucket: boolean;
  visitCount: number;
}): string | null {
  const parts: string[] = [];
  if (input.saved) {
    parts.push("Saved");
  }
  if (input.onBucket) {
    parts.push("Bucket list");
  }
  if (input.visitCount === 1) {
    parts.push("Visit reported");
  } else if (input.visitCount > 1) {
    parts.push(`${input.visitCount} visits reported`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function personalStatusForCafe(
  cafeId: string,
  personal: {
    favorites: { cafeId: string }[];
    bucket: { cafeId: string }[];
    visits: { cafeId: string }[];
  },
): string | null {
  return personalStatusLine({
    saved: personal.favorites.some((item) => item.cafeId === cafeId),
    onBucket: personal.bucket.some((item) => item.cafeId === cafeId),
    visitCount: personal.visits.filter((item) => item.cafeId === cafeId).length,
  });
}

export type PlaceCollection = "saved" | "bucket" | "visited";

export function inCollection(
  cafeId: string,
  collection: PlaceCollection,
  personal: {
    favorites: { cafeId: string }[];
    bucket: { cafeId: string }[];
    visits: { cafeId: string }[];
  },
): boolean {
  if (collection === "saved") {
    return personal.favorites.some((item) => item.cafeId === cafeId);
  }
  if (collection === "bucket") {
    return personal.bucket.some((item) => item.cafeId === cafeId);
  }
  return personal.visits.some((item) => item.cafeId === cafeId);
}
