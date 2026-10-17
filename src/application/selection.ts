export type Viewport = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export type SelectionState = {
  selectedCafeId: string | null;
  viewport: Viewport;
  locationFix: null;
};

export const makatiViewport: Viewport = {
  longitude: 121.028,
  latitude: 14.563,
  zoom: 13,
};

export function selectCafe(state: SelectionState, cafeId: string): SelectionState {
  return {
    ...state,
    selectedCafeId: cafeId,
  };
}

export function clearSelection(state: SelectionState): SelectionState {
  return {
    ...state,
    selectedCafeId: null,
  };
}

export function moveViewport(state: SelectionState, viewport: Viewport): SelectionState {
  return {
    ...state,
    viewport,
  };
}
