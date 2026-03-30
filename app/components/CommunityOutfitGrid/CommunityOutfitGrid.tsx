import Image from "next/image";
import type { CommunityOutfit } from "@/app/data/community-outfits";
import { DeleteOutfitButton } from "@/app/components/DeleteOutfitButton/DeleteOutfitButton";

interface CommunityOutfitGridProps {
  outfits: CommunityOutfit[];
  currentUserId?: string | null;
}

export function CommunityOutfitGrid({ outfits, currentUserId = null }: CommunityOutfitGridProps) {
  if (outfits.length === 0) return null;

  return (
    <section className="mb-10">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        Community Outfits
      </h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {outfits.map((outfit) => (
          <li key={outfit.id} className="relative">
            {/* Polaroid frame */}
            <div className="bg-white shadow-md p-2 pb-0">
              {/* Photo */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={outfit.imageUrl}
                  alt={outfit.submitterName ? `Outfit by ${outfit.submitterName}` : "Community outfit"}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 50vw"
                />
                <div className="absolute inset-0 [box-shadow:inset_0_0_6px_rgba(0,0,0,0.18)] pointer-events-none" />
              </div>

              {/* Polaroid strip: avatar + name */}
              <div className="flex items-center gap-2 px-1 py-2">
                <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-muted border border-foreground/10">
                  {outfit.avatarUrl ? (
                    <Image
                      src={outfit.avatarUrl}
                      alt={outfit.submitterName ?? ""}
                      width={28}
                      height={28}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {outfit.submitterName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {outfit.submitterName ?? "Anonymous"}
                </p>
              </div>
            </div>

            {currentUserId && outfit.userId === currentUserId && (
              <DeleteOutfitButton id={outfit.id} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
