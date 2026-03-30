import Link from "next/link";
import type { CommunityOutfit } from "@/app/data/community-outfits";
import { getCharacterBySlug } from "@/app/data/characters";
import { OutfitCard } from "@/app/components/OutfitCard/OutfitCard";

interface MyOutfitsGridProps {
  outfits: CommunityOutfit[];
}

export function MyOutfitsGrid({ outfits }: MyOutfitsGridProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-primary mb-4">
        My Outfits
      </h2>
      {outfits.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven&apos;t uploaded any outfits yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:gap-4">
          {outfits.map((outfit) => {
            const character = getCharacterBySlug(outfit.characterSlug);
            return (
              <li key={outfit.id}>
                <OutfitCard
                  outfit={outfit}
                  alt={`Your ${outfit.outfitName} outfit`}
                  caption={
                    <Link
                      href={`/characters/${outfit.characterSlug}`}
                      className="text-base font-medium text-foreground hover:underline truncate block"
                    >
                      {character?.name ?? outfit.characterSlug}
                    </Link>
                  }
                  showDelete
                  sizes="(min-width: 640px) 20vw, 33vw"
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
