import { describe, expect, it } from "vitest";
import { mapStyleUrl } from "./mapStyle";

describe("mapStyleUrl", () => {
  it("returns null when the style URL is missing", () => {
    expect(mapStyleUrl(undefined)).toBeNull();
    expect(mapStyleUrl("")).toBeNull();
    expect(mapStyleUrl("  ")).toBeNull();
  });

  it("returns a configured style URL", () => {
    expect(mapStyleUrl(" https://example.test/style.json ")).toBe(
      "https://example.test/style.json",
    );
  });
});
