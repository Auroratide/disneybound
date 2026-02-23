import { getPocketbase } from "@/lib/pocketbase";

export type CommunityOutfit = {
  id: string;
  characterSlug: string;
  outfitName: string;
  imageUrl: string;
  submitterName: string | null;
};

type CommunityOutfitRecord = {
  id: string;
  character_slug: string;
  outfit_name: string;
  image: string;
  submitter_name: string;
  collectionId: string;
  collectionName: string;
};

export async function getCommunityOutfits(
  characterSlug: string,
  outfitName: string
): Promise<CommunityOutfit[]> {
  const pb = getPocketbase();

  const records = await pb.collection("community_outfits").getFullList<CommunityOutfitRecord>({
    filter: pb.filter(
      "character_slug = {:characterSlug} && outfit_name = {:outfitName} && status = 'approved'",
      { characterSlug, outfitName }
    ),
    sort: "-created",
  });

  return records.map((record) => ({
    id: record.id,
    characterSlug: record.character_slug,
    outfitName: record.outfit_name,
    imageUrl: pb.files.getURL(record, record.image),
    submitterName: record.submitter_name || null,
  }));
}
