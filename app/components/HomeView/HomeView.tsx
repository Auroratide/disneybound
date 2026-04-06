"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/app/data/characters";
import { colorMatchesSwatch } from "@/app/lib/color-matching";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";
import { ColorSwatchPicker } from "@/app/components/ColorSwatchPicker/ColorSwatchPicker";

type Props = {
  characters: Character[];
};

export function HomeView({ characters }: Props) {
  const [query, setQuery] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState<string | null>(null);

  function handleSwatchChange(id: string | null) {
    setSelectedSwatch(id);
  }

  const filtered = characters.filter((c) => {
    const matchesQuery = query === "" || [c.name, c.movie].some((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
    const matchesColor = selectedSwatch === null || c.outfits.some((outfit) =>
      outfit.colors.some((color) => colorMatchesSwatch(color.oklch, selectedSwatch))
    );
    return matchesQuery && matchesColor;
  });

  const statusMessage =
    filtered.length === 0
      ? "No characters match your search."
      : `${filtered.length} character${filtered.length === 1 ? "" : "s"} found.`;

  return (
    <>
      {/* Hero band */}
      <div className="bg-primary text-primary-foreground overflow-visible">
        <PageContainer className="pt-6">
          <h1 className="text-5xl font-bold mb-2 text-primary-foreground">Disney Bounding</h1>
          <p className="text-primary-foreground/70 text-lg mb-0">
            Find color palettes to guide your Disney bounding outfits.
          </p>
          <search className="block relative z-10 translate-y-1/2">
            <label
              htmlFor="character-search"
              className="block mb-2 text-sm font-medium text-primary-foreground/80"
            >
              Search by name or movie
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="character-search"
                type="search"
                placeholder="e.g. Ariel"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-card text-foreground border-4 border-primary h-10 text-lg md:text-lg"
              />
              <button
                type="button"
                aria-pressed={colorPickerOpen}
                aria-expanded={colorPickerOpen}
                aria-controls="color-filter"
                onClick={() => setColorPickerOpen((o) => !o)}
                className="shrink-0 h-10 px-3 rounded-md border-4 border-primary bg-card text-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-muted transition-colors"
              >
                {selectedSwatch ? (
                  <span
                    className="w-4 h-4 rounded-full border border-foreground/20 shrink-0"
                    style={{ backgroundColor: getSwatchColor(selectedSwatch) }}
                  />
                ) : (
                  <SwatchIcon />
                )}
                <span className="hidden sm:inline">Color</span>
              </button>
            </div>
            {colorPickerOpen && (
              <div id="color-filter" className="absolute left-0 right-0 top-full z-20 mt-1 bg-card rounded-lg px-3 border border-border shadow-md">
                <ColorSwatchPicker selectedId={selectedSwatch} onChange={handleSwatchChange} />
                <div className="flex items-center gap-2 py-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedSwatch(null)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                  <span className="text-border">·</span>
                  <button
                    type="button"
                    onClick={() => setColorPickerOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <output htmlFor="character-search" className="block mt-3 text-sm text-muted-foreground">
              {statusMessage}
            </output>
          </search>
        </PageContainer>
      </div>

      {/* Content area */}
      <main className="pt-30 pb-12">
        <PageContainer>
        {filtered.length > 0 && (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-6 gap-y-16 overflow-visible pb-4">
            {filtered.map((character) => (
              <li key={character.slug}>
                <Link href={`/characters/${character.slug}`} className="block group">
                  <div
                    className="overflow-visible rounded-xl border-6 group-hover:shadow-lg group-hover:-translate-y-2 group-hover:scale-[1.03] group-focus-within:-translate-y-2 group-focus-within:scale-[1.03] transition-[translate,scale,box-shadow] duration-150"
                    style={{
                      borderColor: `color-mix(in oklch, ${character.outfits[0].cardColor} 80%, black)`,
                      backgroundColor: character.outfits[0].cardColor,
                    }}
                  >
                    <div
                      className="relative h-44 rounded-t-xl overflow-visible"
                      style={{ backgroundColor: character.outfits[0].cardColor }}
                    >
                      <div className="absolute -top-10 inset-x-0 bottom-0">
                        <Image
                          src={character.outfits[0].imageSrc}
                          alt={character.outfits[0].imageAlt}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-card rounded-b-xl text-center">
                      <h3 className="text-lg font-semibold leading-tight">{character.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{character.movie}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        </PageContainer>
      </main>
    </>
  );
}

import { COLOR_SWATCHES } from "@/app/lib/color-matching";

function getSwatchColor(id: string): string {
  const s = COLOR_SWATCHES.find((sw) => sw.id === id);
  return s ? `oklch(${s.oklch.l} ${s.oklch.c} ${s.oklch.h})` : "transparent";
}

function SwatchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" aria-hidden="true" fill="none">
      <circle cx="4" cy="4" r="3" fill="oklch(0.65 0.20 27)" />
      <circle cx="12" cy="4" r="3" fill="oklch(0.75 0.18 150)" />
      <circle cx="4" cy="12" r="3" fill="oklch(0.65 0.20 265)" />
      <circle cx="12" cy="12" r="3" fill="oklch(0.80 0.15 95)" />
    </svg>
  );
}
