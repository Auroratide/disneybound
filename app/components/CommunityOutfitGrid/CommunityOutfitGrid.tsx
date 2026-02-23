import Image from "next/image";
import type { CommunityOutfit } from "@/app/data/community-outfits";

export function CommunityOutfitGrid({ outfits }: { outfits: CommunityOutfit[] }) {
  if (outfits.length === 0) return null;

  return (
    <section className="mb-10">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Community Outfits
      </h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {outfits.map((outfit) => (
          <li key={outfit.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={outfit.imageUrl}
              alt={outfit.submitterName ? `Outfit by ${outfit.submitterName}` : "Community outfit"}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 33vw, 50vw"
            />
            {outfit.submitterName && (
              <p className="absolute bottom-0 inset-x-0 px-2 py-1 text-xs text-white bg-black/50 truncate">
                {outfit.submitterName}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
