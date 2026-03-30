import type PocketBase from "pocketbase";
import type { CommunityOutfit } from "./community-outfits";

type UserOutfitRecord = {
  id: string;
  character_slug: string;
  outfit_name: string;
  image: string;
  user: string;
  collectionId: string;
  collectionName: string;
};

export async function getUserOutfits(pb: PocketBase, userId: string): Promise<CommunityOutfit[]> {
  const records = await pb.collection("community_outfits").getFullList<UserOutfitRecord>({
    filter: pb.filter("user = {:userId} && status = 'approved'", { userId }),
    sort: "-created",
  });

  return records.map((record) => ({
    id: record.id,
    characterSlug: record.character_slug,
    outfitName: record.outfit_name,
    imageUrl: pb.files.getURL(record, record.image),
    userName: null,
    avatarUrl: null,
    userId: record.user,
  }));
}
