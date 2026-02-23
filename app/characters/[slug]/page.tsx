import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Outfit } from "@/app/components/Outfit";
import { CommunityOutfitGrid } from "@/app/components/CommunityOutfitGrid/CommunityOutfitGrid";
import { getAllCharacters, getCharacterBySlug } from "@/app/data/characters";
import { getCommunityOutfits, type CommunityOutfit } from "@/app/data/community-outfits";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCharacters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);
  if (!character) return {};

  return {
    title: `${character.name} - Disney Bounding`,
    description: `Disney Bounding color guide for ${character.name} from ${character.movie}`,
  };
}

async function fetchCommunityOutfits(slug: string, outfitName: string): Promise<CommunityOutfit[]> {
  try {
    return await getCommunityOutfits(slug, outfitName);
  } catch {
    // Pocketbase may be unavailable (e.g. at build time) — show nothing rather than error.
    return [];
  }
}

export default async function CharacterPage({ params }: Params) {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);
  if (!character) notFound();

  const communityOutfitsByOutfit = await Promise.all(
    character.outfits.map((outfit) => fetchCommunityOutfits(slug, outfit.name))
  );

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
        ← All characters
      </Link>
      <p className="text-sm text-foreground/60 mb-2">{character.movie}</p>
      <h1 className="text-4xl font-bold mb-6">{character.name}</h1>

      {character.outfits.map((outfit, i) => (
        <div key={outfit.name}>
          <Outfit
            name={outfit.name}
            imageSrc={outfit.imageSrc}
            imageAlt={outfit.imageAlt}
            cardColor={outfit.cardColor}
            colors={outfit.colors}
          />
          <CommunityOutfitGrid outfits={communityOutfitsByOutfit[i]} />
        </div>
      ))}
    </main>
  );
}
