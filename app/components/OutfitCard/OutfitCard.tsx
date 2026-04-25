import Image from "next/image";
import { DeleteOutfitButton } from "@/app/components/DeleteOutfitButton/DeleteOutfitButton";

interface OutfitCardProps {
  outfit: { id: string; imageUrl: string };
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
        <div className="relative aspect-square overflow-hidden bg-white">
          <img-zoom className="absolute inset-0">
            <Image
              src={outfit.imageUrl}
              alt={alt}
              width={400}
              height={400}
              className="object-contain w-full h-full"
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
