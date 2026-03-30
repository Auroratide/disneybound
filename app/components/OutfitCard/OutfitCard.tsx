import Image from "next/image";
import type { CommunityOutfit } from "@/app/data/community-outfits";
import { DeleteOutfitButton } from "@/app/components/DeleteOutfitButton/DeleteOutfitButton";

interface OutfitCardProps {
  outfit: CommunityOutfit;
  alt: string;
  caption?: React.ReactNode;
  showDelete?: boolean;
  sizes?: string;
}

export function OutfitCard({
  outfit,
  alt,
  caption,
  showDelete = false,
  sizes = "(min-width: 640px) 33vw, 50vw",
}: OutfitCardProps) {
  return (
    <figure className="relative">
      {/* Polaroid frame */}
      <div className={`bg-white shadow-md p-2 ${caption ? "pb-0" : ""}`}>
        {/* Photo */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img-zoom className="absolute inset-0">
            <Image
              src={outfit.imageUrl}
              alt={alt}
              width={400}
              height={400}
              className="object-cover w-full h-full"
              sizes={sizes}
            />
          </img-zoom>
          <div className="absolute inset-0 [box-shadow:inset_0_0_6px_rgba(0,0,0,0.18)] pointer-events-none" />
        </div>

        {/* Polaroid caption strip */}
        {caption && (
          <figcaption className="px-1 py-2">
            {caption}
          </figcaption>
        )}
      </div>

      {showDelete && <DeleteOutfitButton id={outfit.id} />}
    </figure>
  );
}
