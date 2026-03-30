import Image from "next/image";
import type { CommunityOutfit } from "@/app/data/community-outfits";
import { OutfitCard } from "@/app/components/OutfitCard/OutfitCard";

interface CommunityOutfitGridProps {
  outfits: CommunityOutfit[];
  currentUserId?: string | null;
}

function UserCaption({ outfit }: { outfit: CommunityOutfit }) {
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-muted border border-foreground/10">
        {outfit.avatarUrl ? (
          <Image
            src={outfit.avatarUrl}
            alt={outfit.userName ?? ""}
            width={28}
            height={28}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
            {outfit.userName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
      <p className="text-base font-medium text-foreground truncate">
        {outfit.userName ?? "Anonymous"}
      </p>
    </div>
  );
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
          <li key={outfit.id}>
            <OutfitCard
              outfit={outfit}
              alt={outfit.userName ? `Outfit by ${outfit.userName}` : "Community outfit"}
              caption={<UserCaption outfit={outfit} />}
              showDelete={currentUserId != null && outfit.userId === currentUserId}
              sizes="(min-width: 640px) 33vw, 50vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
