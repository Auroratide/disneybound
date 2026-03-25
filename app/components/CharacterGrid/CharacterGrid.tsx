"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/app/data/characters";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  characters: Character[];
};

export function CharacterGrid({ characters }: Props) {
  const [query, setQuery] = useState("");

  const filtered = characters.filter((c) =>
    [c.name, c.movie].some((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    )
  );

  const statusMessage =
    filtered.length === 0
      ? "No characters match your search."
      : `${filtered.length} character${filtered.length === 1 ? "" : "s"} found.`;

  return (
    <div>
      <label htmlFor="character-search" className="block mb-2 text-sm font-medium">
        Search by name or movie
      </label>
      <Input
        id="character-search"
        type="search"
        placeholder="Search by name or movie…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 bg-card"
      />

      <p role="status" aria-live="polite" aria-atomic="true" className="mb-8 text-sm text-muted-foreground">
        {statusMessage}
      </p>

      {filtered.length === 0 ? null : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 overflow-visible pb-4">
          {filtered.map((character) => (
            <li key={character.slug}>
              <Link href={`/characters/${character.slug}`} className="block group">
                <Card
                  className="overflow-visible p-0 gap-0 border-6 group-hover:shadow-lg group-hover:-translate-y-2 group-hover:scale-[1.03] group-focus-within:-translate-y-2 group-focus-within:scale-[1.03] transition-[translate,scale,box-shadow] duration-150"
                  style={{ borderColor: `color-mix(in oklch, ${character.outfits[0].cardColor} 80%, black)`, backgroundColor: character.outfits[0].cardColor }}
                >
                  {/* Colored top band — image peeks above the card via negative margin */}
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
                  <CardContent className="p-4 bg-card rounded-b-xl text-center">
                    <h3 className="text-lg font-semibold leading-tight">{character.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{character.movie}</p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
