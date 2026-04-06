export type OklchColor = { l: number; c: number; h: number };

export type ColorSwatch = {
  id: string;
  name: string;
  /** Representative oklch point — used to render the swatch button via CSS oklch() */
  oklch: OklchColor;
  matches: (color: OklchColor) => boolean;
};

function hueInRange(h: number, hMin: number, hMax: number): boolean {
  const normalised = ((h % 360) + 360) % 360;
  if (hMax <= 360) return normalised >= hMin && normalised <= hMax;
  // Wrapping case: e.g. pink spans 340–365 → matches 340–360 OR 0–5
  return normalised >= hMin || normalised <= hMax - 360;
}

function saturated(color: OklchColor, hMin: number, hMax: number, cMin = 0.06): boolean {
  return color.c >= cMin && hueInRange(color.h, hMin, hMax);
}

/**
 * The 16 canonical color swatches. Each has an oklch representative for rendering
 * and a matches() predicate for filtering. To add more swatches, append to this array.
 */
export const COLOR_SWATCHES: ColorSwatch[] = [
  {
    id: "red",
    name: "Red",
    oklch: { l: 0.55, c: 0.22, h: 27 },
    matches: (c) => saturated(c, 5, 40, 0.10),
  },
  {
    id: "orange",
    name: "Orange",
    oklch: { l: 0.65, c: 0.20, h: 52 },
    matches: (c) => saturated(c, 40, 65, 0.10),
  },
  {
    id: "yellow",
    name: "Yellow",
    oklch: { l: 0.87, c: 0.18, h: 95 },
    // Includes gold, amber — high chroma warm yellows
    matches: (c) => saturated(c, 65, 110, 0.10),
  },
  {
    id: "lime",
    name: "Lime",
    oklch: { l: 0.75, c: 0.20, h: 125 },
    matches: (c) => saturated(c, 110, 135, 0.08),
  },
  {
    id: "green",
    name: "Green",
    oklch: { l: 0.60, c: 0.18, h: 150 },
    // Includes seafoam green
    matches: (c) => saturated(c, 135, 165, 0.08),
  },
  {
    id: "teal",
    name: "Teal",
    oklch: { l: 0.62, c: 0.12, h: 185 },
    matches: (c) => saturated(c, 165, 205, 0.06),
  },
  {
    id: "cyan",
    name: "Cyan",
    oklch: { l: 0.72, c: 0.12, h: 210 },
    // Includes muted teals like #4A7C8E
    matches: (c) => saturated(c, 205, 225, 0.06),
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    oklch: { l: 0.75, c: 0.12, h: 235 },
    // Includes light blues like #87CEEB and cornflower blues like #5B9BD5
    matches: (c) => saturated(c, 225, 255, 0.06),
  },
  {
    id: "blue",
    name: "Blue",
    oklch: { l: 0.55, c: 0.18, h: 265 },
    matches: (c) => saturated(c, 255, 278, 0.06),
  },
  {
    id: "indigo",
    name: "Indigo",
    oklch: { l: 0.50, c: 0.18, h: 293 },
    // Includes lavender at higher saturation e.g. #9B7ED8
    matches: (c) => saturated(c, 278, 308, 0.06),
  },
  {
    id: "purple",
    name: "Purple",
    oklch: { l: 0.55, c: 0.20, h: 320 },
    // Includes lavender/violet e.g. #9B59B6
    matches: (c) => saturated(c, 308, 340, 0.06),
  },
  {
    id: "pink",
    name: "Pink",
    oklch: { l: 0.72, c: 0.15, h: 355 },
    // Wraps around 0° — covers rose, hot pink, magenta-pink
    matches: (c) => saturated(c, 340, 365, 0.06),
  },
  {
    id: "white",
    name: "White",
    oklch: { l: 0.97, c: 0.00, h: 0 },
    matches: (c) => c.l >= 0.88 && c.c < 0.015,
  },
  {
    id: "cream",
    name: "Cream",
    oklch: { l: 0.93, c: 0.03, h: 85 },
    // Off-white with warm tint: low chroma but non-zero, high lightness
    matches: (c) => c.l >= 0.80 && c.c >= 0.015 && c.c < 0.07 && hueInRange(c.h, 50, 120),
  },
  {
    id: "brown",
    name: "Brown",
    oklch: { l: 0.50, c: 0.08, h: 55 },
    // Dark warm tones: medium lightness, low-medium chroma, warm hue
    matches: (c) => c.l >= 0.25 && c.l <= 0.65 && c.c >= 0.04 && c.c < 0.15 && hueInRange(c.h, 25, 85),
  },
  {
    id: "black",
    name: "Black",
    oklch: { l: 0.20, c: 0.00, h: 0 },
    matches: (c) => c.l < 0.30 && c.c < 0.05,
  },
];

export function colorMatchesSwatch(color: OklchColor, swatchId: string): boolean {
  const swatch = COLOR_SWATCHES.find((s) => s.id === swatchId);
  return swatch ? swatch.matches(color) : false;
}
