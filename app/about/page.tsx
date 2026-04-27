import type { Metadata } from "next";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

export const metadata: Metadata = {
  title: "About - Disney Bounding",
  description: "What is Disney Bounding and what is this site for?",
};

export default function AboutPage() {
  return (
    <main>
      <PageContainer className="py-12 max-w-xl">
        <h1 className="text-4xl font-bold mb-6">What is Disney Bounding?</h1>

        <section className="mb-8">
          <p className="text-foreground/80 leading-relaxed">
            <strong>Disney Bounding</strong> is the art of assembling everyday outfits inspired by Disney characters!
            Rather than wearing a costume, you use color palettes, silhouettes, and accessories to
            subtly evoke a character through regular clothing. It&apos;s a way to bring a little Disney magic
            into your daily life or your next park visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Share your outfits!</h2>
          <p className="mb-4 text-foreground/80 leading-relaxed">
            The main purpose of this site is to inspire people! Find the colors that match your favorite character, or find characters that match colors you have on hand. See how others have dressed as characters to get ideas for what to find in stores.
          </p>

          <p className="text-foreground/80 leading-relaxed">
            Particularly proud of an outfit? Share a photo with others!
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Who made this site?</h2>
          <p className="mb-4 text-foreground/80 leading-relaxed">
            Hi, I&apos;m Auroratide! I love my mom, and she loves Disney (and she loves me too!). I also happen to be a web developer, so I made her a website ♥
          </p>

          <p className="text-foreground/80 leading-relaxed">
            If you&apos;re curious about the various other things I do, you can visit my website, <strong><a href="https://auroratide.com">auroratide.com</a></strong>!
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
