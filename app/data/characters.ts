import type { OklchColor } from "@/app/lib/color-matching";
import { getPocketbase } from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

export type OutfitColor = {
  name: string;
  oklch: OklchColor;
  usage?: string;
};

export type Character = {
  slug: string;
  name: string;
  movie: string;
  outfitName: string;
  imageSrc: string;
  imageAlt: string;
  cardColor: string;
  colors: OutfitColor[];
};

function recordToCharacter(record: RecordModel): Character {
  const pb = getPocketbase();
  return {
    slug: record.slug,
    name: record.name,
    movie: record.movie,
    outfitName: record.outfit_name,
    imageSrc: pb.files.getURL(record, record.image),
    imageAlt: record.image_alt,
    cardColor: record.card_color,
    colors: record.colors as OutfitColor[],
  };
}

export async function getAllCharacters(): Promise<Character[]> {
  const pb = getPocketbase();
  const records = await pb.collection("characters").getFullList({
    filter: "status = 'approved'",
    sort: "name,outfit_name",
  });
  return records.map(recordToCharacter);
}

export async function getCharacterBySlug(slug: string): Promise<Character | undefined> {
  const pb = getPocketbase();
  const records = await pb.collection("characters").getFullList({
    filter: pb.filter("slug = {:slug} && status = 'approved'", { slug }),
  });
  return records[0] ? recordToCharacter(records[0]) : undefined;
}
