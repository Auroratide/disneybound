import Image from "next/image";
import type { CommunityOutfit } from "@/app/data/community-outfits";
import { DeleteOutfitButton } from "@/app/components/DeleteOutfitButton/DeleteOutfitButton";

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
          {outfits.map((outfit) => (
            <li key={outfit.id} className="relative">
              <div className="bg-white shadow-md p-2">
                <img-zoom className="block relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={outfit.imageUrl}
                    alt={`Your ${outfit.outfitName} outfit`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 20vw, 33vw"
                  />
                </img-zoom>
              </div>
              <DeleteOutfitButton id={outfit.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
