"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/app/data/characters";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

type Props = {
  characters: Character[];
};

export function HomeView({ characters }: Props) {
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
            <Input
              id="character-search"
              type="search"
              placeholder="e.g. Ariel"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-card text-foreground border-3 border-primary"
            />
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
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 overflow-visible pb-4">
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
