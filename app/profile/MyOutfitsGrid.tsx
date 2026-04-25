import Link from "next/link";
import type { UserOutfit } from "@/app/data/user-outfits";
import { slugify } from "@/app/lib/slugify";
import { OutfitCard } from "@/app/components/OutfitCard/OutfitCard";

interface MyOutfitsGridProps {
  outfits: UserOutfit[];
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
            const fullSlug = `${outfit.characterSlug}/${slugify(outfit.outfitName)}`;
            const label = outfit.characterName
              ? `${outfit.characterName} - ${outfit.outfitName}`
              : outfit.outfitName;
            return (
              <li key={outfit.id}>
                <OutfitCard
                  outfit={outfit}
                  alt={`Your ${outfit.outfitName} outfit`}
                  caption={
                    <Link
                      href={`/characters/${fullSlug}`}
                      className="text-base font-medium text-foreground hover:underline truncate block text-center"
                    >
                      {label}
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
