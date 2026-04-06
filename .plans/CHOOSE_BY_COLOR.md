# Choose by Color

Allow users to filter characters by color palette using a pre-defined set of 16 color swatches. Matching is done in Oklch color space because it is perceptually uniform — equal numeric distances correspond to equal perceived differences in color.

## How Oklch works here

Each character color is stored as `{ l, c, h }` where:
- **L** (Lightness): 0–1 (0 = black, 1 = white)
- **C** (Chroma): 0–0.4 (0 = gray/neutral, higher = more vivid)
- **H** (Hue): 0–360° (red ≈ 27°, yellow ≈ 90°, green ≈ 145°, blue ≈ 260°, purple ≈ 305°)

A character color **matches** a swatch if its L, C, and H all fall within the swatch's defined ranges. Hue ranges that cross 0° (e.g., red wrapping from 345° to 15°) need modular arithmetic.

## The 16 color swatches

Each swatch has:
- A display name and representative hex for rendering the swatch UI
- Oklch ranges `{ lMin, lMax, cMin, cMax, hMin, hMax }` for matching
- Neutrals (white, cream, brown, black) match on L + C thresholds; hue is unconstrained or loosely constrained

| # | Name | Approx. Hue range | Notes |
|---|------|--------------------|-------|
| 1 | Red | H 5–40° | |
| 2 | Orange | H 40–65° | |
| 3 | Yellow | H 65–105° | Includes gold |
| 4 | Lime | H 105–135° | Yellow-green |
| 5 | Green | H 135–165° | |
| 6 | Teal | H 165–200° | Seafoam, mint |
| 7 | Cyan | H 200–225° | Aqua |
| 8 | Sky Blue | H 225–255° | Light blue |
| 9 | Blue | H 255–275° | |
| 10 | Indigo | H 275–305° | |
| 11 | Purple | H 305–335° | Violet, magenta |
| 12 | Pink | H 335–365°/0–5° | Wraps around 0° |
| 13 | White | C < 0.04, L > 0.88 | Any hue |
| 14 | Cream | C < 0.06, L 0.75–0.88 | Any hue |
| 15 | Brown | C 0.04–0.12, L 0.30–0.58, H 30–80° | Dark warm tones |
| 16 | Black | C < 0.06, L < 0.30 | Any hue |

> Exact range boundaries will need empirical tuning as more characters are added. The split between e.g. Blue and Indigo is a judgment call that can be adjusted.

## Data changes

### `OutfitColor` type

Replace `hex` with `oklch` entirely. CSS renders it directly as `oklch(l c h)`:

```ts
export type OutfitColor = {
  name: string;
  oklch: { l: number; c: number; h: number };
  usage: string;
};
```

### Character data

Each existing `hex` value is replaced by an `oklch` triple. Example:

```ts
{ name: "Gold",   oklch: { l: 0.85, c: 0.18, h: 90 },  usage: "..." }
{ name: "Yellow", oklch: { l: 0.85, c: 0.18, h: 90 },  usage: "..." }
{ name: "Cream",  oklch: { l: 0.94, c: 0.03, h: 75 },  usage: "..." }
{ name: "Brown",  oklch: { l: 0.47, c: 0.08, h: 52 },  usage: "..." }
```

A helper to convert the existing hex values → oklch can generate these numbers; they then get copy-pasted into the data file (no runtime conversion needed). The `hex` field is deleted and not kept anywhere.

### CSS usage

Wherever a color is rendered (character page color swatches, filter picker), use inline style with CSS oklch syntax:

```tsx
style={{ backgroundColor: `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h})` }}
```

Same applies to the `ColorSwatch` definitions — their display color is derived from the same `{ l, c, h }` values, not a separate hex.

## Matching logic

```ts
// src/lib/color-matching.ts

export type OklchColor = { l: number; c: number; h: number };

export type ColorSwatch = {
  id: string;
  name: string;
  oklch: { l: number; c: number; h: number }; // representative point, used to render the swatch button
  lMin: number; lMax: number;
  cMin: number; cMax: number;
  hMin: number; hMax: number; // hMax may exceed 360 for wrapping (e.g. 345–375 for pink)
};

export const COLOR_SWATCHES: ColorSwatch[] = [ /* 16 entries */ ];

function hueInRange(h: number, hMin: number, hMax: number): boolean {
  // Normalise hue to [0, 360)
  const normalised = ((h % 360) + 360) % 360;
  if (hMax <= 360) return normalised >= hMin && normalised <= hMax;
  // Wrapping case: hMin–360 OR 0–(hMax - 360)
  return normalised >= hMin || normalised <= hMax - 360;
}

export function colorMatchesSwatch(color: OklchColor, swatch: ColorSwatch): boolean {
  return (
    color.l >= swatch.lMin && color.l <= swatch.lMax &&
    color.c >= swatch.cMin && color.c <= swatch.cMax &&
    hueInRange(color.h, swatch.hMin, swatch.hMax)
  );
}

export function characterMatchesSwatch(character: Character, swatchId: string): boolean {
  const swatch = COLOR_SWATCHES.find(s => s.id === swatchId);
  if (!swatch) return false;
  return character.outfits.some(outfit =>
    outfit.colors.some(color => colorMatchesSwatch(color.oklch, swatch))
  );
}
```

## UI

### Color swatch picker (on the home page)

Replace or extend the current search bar area with a row of 16 circular color swatches beneath it. Clicking a swatch toggles it as the active color filter; clicking the active swatch deselects it (shows all). Only one swatch active at a time for now.

- Each swatch: a small circle rendered with `background-color: oklch(l c h)` from the swatch's representative oklch point, with a ring/outline when selected
- A "All colors" or clear button if a swatch is active
- On mobile, the swatches wrap to two rows

The text search and the color filter compose: a character must match both (if both are active).

### Character card indication (optional, later)

When a color filter is active, consider highlighting or showing which color on a character card triggered the match. Low priority for initial implementation.

## Implementation steps

1. **Define the 16 `ColorSwatch` entries** with Oklch ranges and representative hex values. Verify by checking that all current character colors land in the expected swatch.

2. **Replace `hex` with `oklch`** in `OutfitColor` type and populate values for all existing characters. Write a one-off conversion utility (hex → oklch) to generate the numbers, then hardcode them and delete the hex fields.

3. **Write and unit-test the matching logic** (`colorMatchesSwatch`, `characterMatchesSwatch`, hue wraparound).

4. **Build the swatch picker UI component** (`ColorSwatchPicker`). Renders 16 circles, manages selected state, emits the selected swatch id (or null).

5. **Wire filter into `HomeView`**: add `selectedSwatch` state, pass into the filter predicate alongside the existing name/movie search.

6. **Tune Oklch ranges** by checking every character color lands in the right swatch bucket, adjusting boundaries where they feel wrong.

## Open questions

- Should multiple swatches be selectable at once (OR logic)? Start with single-select; multi-select can be added if users want it.
  - No. You should only be able to select one single color at a time.
- Should the swatch picker be visible immediately, or behind a "Filter by color" toggle to keep the home page clean? Depends on how it looks with the 16 swatches displayed.
  - Put it behind a toggle. I imagine on desktop at least that it exists sort of beside the search bar, but I'm not sure what it should look like on mobile.
- 16 swatches enough? Pink and Lavender may need to be split once more characters are added.
  - For now yes. Make sure in the code it is easy to extend though for when more colors become needed.
