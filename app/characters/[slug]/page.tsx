import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Outfit } from "@/app/components/Outfit";
import { CommunityOutfitsSection } from "@/app/components/CommunityOutfitsSection/CommunityOutfitsSection";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";
import { getAllCharacters, getCharacterBySlug } from "@/app/data/characters";
import { getCommunityOutfits, type CommunityOutfit } from "@/app/data/community-outfits";
import { getServerAuth } from "@/lib/auth";
import { ImgZoomRegistrar } from "@/app/components/ImgZoomRegistrar/ImgZoomRegistrar";

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

  const [{ user }, communityOutfitsByOutfit] = await Promise.all([
    getServerAuth(),
    Promise.all(character.outfits.map((outfit) => fetchCommunityOutfits(slug, outfit.name))),
  ]);

  return (
    <main>
      <ImgZoomRegistrar />
      <PageContainer className="pt-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block">
          ← All characters
        </Link>
      </PageContainer>

      <div className="text-center pb-20">
        <h1 className="text-7xl font-bold">{character.name}</h1>
        <p className="text-lg text-foreground/60 mt-2">{character.movie}</p>
      </div>

      <PageContainer className="pb-12">

      {character.outfits.map((outfit, i) => (
        <div key={outfit.name} className="mb-32">
          <Outfit
            name={outfit.name}
            imageSrc={outfit.imageSrc}
            imageAlt={outfit.imageAlt}
            cardColor={outfit.cardColor}
            colors={outfit.colors}
          />
          <CommunityOutfitsSection
            outfits={communityOutfitsByOutfit[i]}
            currentUserId={user?.id ?? null}
            characterSlug={slug}
            outfitName={outfit.name}
            instructions={communityOutfitsByOutfit[i].length > 0
              ? `Want to provide inspiration? Share your outfit of ${character.name}!`
              : `Be the first to share an outfit of ${character.name}!`
            }
          />
        </div>
      ))}
      </PageContainer>
    </main>
  );
}
