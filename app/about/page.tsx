import type { Metadata } from "next";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

export const metadata: Metadata = {
  title: "About - Disney Bounding",
  description: "What is Disney Bounding and what is this site for?",
};

export default function AboutPage() {
  return (
    <main>
      <PageContainer className="py-12 max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">About</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">What is Disney Bounding?</h2>
          <p className="text-foreground/80 leading-relaxed">
            Disney Bounding is the art of assembling everyday outfits inspired by Disney characters.
            Rather than wearing a costume, you use color palettes, silhouettes, and accessories to
            subtly evoke a character through regular clothing — a way to bring a little Disney magic
            into your daily life or your next park visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">What is this site?</h2>
          <p className="text-foreground/80 leading-relaxed">
            This site is a catalog of color palette guides to help you build your Disney Bounding
            outfits. Browse characters to find their signature colors, get inspired by outfits shared
            by the community, and share your own creations.
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
