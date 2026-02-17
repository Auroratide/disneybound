import Image from "next/image";
import Link from "next/link";
import { getAllCharacters } from "@/app/data/characters";

export default function Home() {
  const characters = getAllCharacters();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Disney Bounding</h1>
      <p className="text-foreground/60 mb-10">Find color palettes to guide your Disney bounding outfits.</p>

      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {characters.map((character) => (
          <li key={character.slug}>
            <Link href={`/characters/${character.slug}`} className="group block rounded-xl overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-colors">
              <div className="relative aspect-square" style={{ backgroundColor: character.outfits[0].cardColor }}>
                <Image
                  src={character.outfits[0].imageSrc}
                  alt={character.outfits[0].imageAlt}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold">{character.name}</p>
                <p className="text-sm text-foreground/60">{character.movie}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
