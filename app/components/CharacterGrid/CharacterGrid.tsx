"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/app/data/characters";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <label htmlFor="character-search" className="block mb-2">
        Search by name or movie
      </label>
      <Input
        id="character-search"
        type="search"
        placeholder="Search by name or movie…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      <p role="status" aria-live="polite" aria-atomic="true" className="mb-8 text-sm text-muted-foreground">
        {statusMessage}
      </p>

      {filtered.length === 0 ? null : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {filtered.map((character) => (
            <li key={character.slug}>
              <Card className="overflow-hidden p-0 gap-0 hover:border-foreground/30 transition-colors">
                <Link href={`/characters/${character.slug}`} className="block">
                  <div
                    className="relative aspect-square"
                    style={{ backgroundColor: character.outfits[0].cardColor }}
                  >
                    <Image
                      src={character.outfits[0].imageSrc}
                      alt={character.outfits[0].imageAlt}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold">{character.name}</p>
                    <Badge variant="secondary" className="mt-1">{character.movie}</Badge>
                  </CardContent>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
