import { describe, expect, it } from "vitest";
import {
  clearSelection,
  makatiViewport,
  moveViewport,
  selectCafe,
  type SelectionState,
} from "./selection";

const initial: SelectionState = {
  selectedCafeId: null,
  viewport: makatiViewport,
  locationFix: null,
};

describe("selection", () => {
  it("highlights one café and leaves the location fix untouched", () => {
    const next = selectCafe(initial, "demo-north-margin");
    expect(next.selectedCafeId).toBe("demo-north-margin");
    expect(next.locationFix).toBeNull();
    expect(next.viewport).toEqual(makatiViewport);
  });

  it("clears the selected café", () => {
    const selected = selectCafe(initial, "demo-north-margin");
    expect(clearSelection(selected).selectedCafeId).toBeNull();
  });

  it("keeps the selected café when the viewport moves", () => {
    const selected = selectCafe(initial, "demo-folded-page");
    const moved = moveViewport(selected, {
      longitude: 121.04,
      latitude: 14.57,
      zoom: 14,
    });
    expect(moved.selectedCafeId).toBe("demo-folded-page");
    expect(moved.locationFix).toBeNull();
    expect(moved.viewport.longitude).toBe(121.04);
  });
});
