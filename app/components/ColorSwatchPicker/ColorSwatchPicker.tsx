"use client";

import { COLOR_SWATCHES } from "@/app/lib/color-matching";

interface ColorSwatchPickerProps {
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function ColorSwatchPicker({ selectedId, onChange }: ColorSwatchPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 py-2" role="group" aria-label="Filter by color">
      {COLOR_SWATCHES.map((swatch) => {
        const isSelected = swatch.id === selectedId;
        const bg = `oklch(${swatch.oklch.l} ${swatch.oklch.c} ${swatch.oklch.h})`;
        return (
          <button
            key={swatch.id}
            type="button"
            aria-label={swatch.name}
            aria-pressed={isSelected}
            onClick={() => onChange(isSelected ? null : swatch.id)}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            style={{
              backgroundColor: bg,
              borderColor: isSelected ? "oklch(0.3 0 0)" : "oklch(0.8 0 0)",
              boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px oklch(0.3 0 0)` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
