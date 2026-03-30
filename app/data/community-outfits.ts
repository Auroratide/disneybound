import { getPocketbase } from "@/lib/pocketbase";

export type CommunityOutfit = {
  id: string;
  characterSlug: string;
  outfitName: string;
  imageUrl: string;
  userName: string | null;
  avatarUrl: string | null;
  userId: string | null;
};

type CommunityOutfitRecord = {
  id: string;
  character_slug: string;
  outfit_name: string;
  image: string;
  user: string;
  collectionId: string;
  collectionName: string;
  expand?: {
    user?: {
      id: string;
      name: string;
      avatar: string;
      collectionId: string;
      collectionName: string;
    };
  };
};

export async function getCommunityOutfits(
  characterSlug: string,
  outfitName: string
): Promise<CommunityOutfit[]> {
  const pb = getPocketbase();

  const records = await pb.collection("community_outfits").getFullList<CommunityOutfitRecord>({
    filter: pb.filter(
      "character_slug = {:characterSlug} && outfit_name = {:outfitName}",
      { characterSlug, outfitName }
    ),
    sort: "-created",
    expand: "user",
  });

  return records.map((record) => {
    const expandedUser = record.expand?.user;
    const avatarUrl =
      expandedUser?.avatar
        ? pb.files.getURL(expandedUser, expandedUser.avatar)
        : null;

    return {
      id: record.id,
      characterSlug: record.character_slug,
      outfitName: record.outfit_name,
      imageUrl: pb.files.getURL(record, record.image),
      userName: expandedUser?.name ?? null,
      avatarUrl,
      userId: record.user || null,
    };
  });
}
