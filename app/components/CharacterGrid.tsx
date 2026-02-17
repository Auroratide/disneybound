"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/app/data/characters";

type Props = {
  characters: Character[];
};

export default function CharacterGrid({ characters }: Props) {
  const [query, setQuery] = useState("");

  const filtered = characters.filter((c) =>
    [c.name, c.movie].some((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div>
      <input
        type="search"
        placeholder="Search by name or movie…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-8 px-4 py-2 rounded-lg border border-foreground/20 bg-transparent focus:outline-none focus:border-foreground/50"
      />

      {filtered.length === 0 ? (
        <p className="text-foreground/60">No characters match your search.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {filtered.map((character) => (
            <li key={character.slug}>
              <Link
                href={`/characters/${character.slug}`}
                className="group block rounded-xl overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-colors"
              >
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
                <div className="p-3">
                  <p className="font-semibold">{character.name}</p>
                  <p className="text-sm text-foreground/60">{character.movie}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
