"use client";

import { COLOR_SWATCHES } from "@/app/lib/color-matching";

interface ColorSwatchPickerProps {
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function ColorSwatchPicker({ selectedId, onChange }: ColorSwatchPickerProps) {
  return (
    <fieldset className="flex flex-wrap gap-2 py-2 border-0 p-0 m-0">
      <legend className="sr-only">Filter by color</legend>
      {COLOR_SWATCHES.map((swatch) => {
        const isSelected = swatch.id === selectedId;
        const bg = `oklch(${swatch.oklch.l} ${swatch.oklch.c} ${swatch.oklch.h})`;
        return (
          <label key={swatch.id} className="cursor-pointer hover:scale-110 transition-transform">
            <input
              type="radio"
              name="color-filter"
              value={swatch.id}
              checked={isSelected}
              onChange={() => onChange(swatch.id)}
              onClick={() => { if (isSelected) onChange(null); }}
              className="sr-only peer"
            />
            <span className="sr-only">{swatch.name}</span>
            <span
              aria-hidden="true"
              className="block w-8 h-8 rounded-full border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
              style={{
                backgroundColor: bg,
                borderColor: isSelected ? "oklch(0.3 0 0)" : "oklch(0.8 0 0)",
                boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px oklch(0.3 0 0)` : undefined,
              }}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
