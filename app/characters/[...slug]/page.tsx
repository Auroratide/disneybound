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

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  const characters = await getAllCharacters();
  return characters.map((c) => ({ slug: c.slug.split("/") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const characterData = await getCharacterBySlug(slug.join("/"));
  if (!characterData) return {};

  return {
    title: `${characterData.name} (${characterData.outfitName}) - Disney Bounding`,
    description: `Disney Bounding color guide for ${characterData.name} from ${characterData.movie}`,
  };
}

async function fetchCommunityOutfits(characterSlug: string, outfitName: string): Promise<CommunityOutfit[]> {
  try {
    return await getCommunityOutfits(characterSlug, outfitName);
  } catch {
    // Pocketbase may be unavailable (e.g. at build time) — show nothing rather than error.
    return [];
  }
}

export default async function CharacterPage({ params }: Params) {
  const { slug } = await params;
  const characterData = await getCharacterBySlug(slug.join("/"));
  if (!characterData) notFound();

  const characterSlug = slug[0];

  const [{ user }, communityOutfits] = await Promise.all([
    getServerAuth(),
    fetchCommunityOutfits(characterSlug, characterData.outfitName),
  ]);

  return (
    <main>
      <ImgZoomRegistrar />
      <PageContainer className="pt-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block">
          ← All characters
        </Link>
      </PageContainer>

      <div className="text-center pb-8">
        <h1 className="text-7xl font-bold">{characterData.name}</h1>
        <p className="text-lg text-foreground/60 mt-2">{characterData.movie}</p>
        <p className="text-base text-foreground/50 mt-1">{characterData.outfitName}</p>
      </div>

      <PageContainer className="pb-12">
        <Outfit
          imageSrc={characterData.imageSrc}
          imageAlt={characterData.imageAlt}
          cardColor={characterData.cardColor}
          colors={characterData.colors}
        />
        <div className="mt-20">
        <CommunityOutfitsSection
          outfits={communityOutfits}
          currentUserId={user?.id ?? null}
          characterSlug={characterSlug}
          outfitName={characterData.outfitName}
          instructions={communityOutfits.length > 0
            ? `Want to provide inspiration? Share your outfit of ${characterData.name}!`
            : `Be the first to share an outfit of ${characterData.name}!`
          }
        />
        </div>
      </PageContainer>
    </main>
  );
}
