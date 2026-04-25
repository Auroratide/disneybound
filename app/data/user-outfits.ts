import type PocketBase from "pocketbase";
import { slugify } from "@/app/lib/slugify";

export type UserOutfit = {
  id: string;
  characterSlug: string;
  characterName: string | null;
  outfitName: string;
  imageUrl: string;
  userId: string;
};

type UserOutfitRecord = {
  id: string;
  character_slug: string;
  outfit_name: string;
  image: string;
  user: string;
  collectionId: string;
  collectionName: string;
};

export async function getUserOutfits(pb: PocketBase, userId: string): Promise<UserOutfit[]> {
  const records = await pb.collection("community_outfits").getFullList<UserOutfitRecord>({
    filter: pb.filter("user = {:userId} && status = 'approved'", { userId }),
    sort: "-created",
  });

  // Batch-fetch character names in one query using the full slug (character_slug/outfit-slug).
  const fullSlugs = [...new Set(records.map(r => `${r.character_slug}/${slugify(r.outfit_name)}`))];
  const charNameBySlug: Record<string, string> = {};
  if (fullSlugs.length > 0) {
    const filter = fullSlugs.map(s => `slug = '${s}'`).join(" || ");
    const characters = await pb.collection("characters").getFullList({ filter });
    for (const c of characters) {
      charNameBySlug[c.slug] = c.name as string;
    }
  }

  return records.map((record) => {
    const fullSlug = `${record.character_slug}/${slugify(record.outfit_name)}`;
    return {
      id: record.id,
      characterSlug: record.character_slug,
      characterName: charNameBySlug[fullSlug] ?? null,
      outfitName: record.outfit_name,
      imageUrl: pb.files.getURL(record, record.image),
      userId: record.user,
    };
  });
}
