import { getAllCharacters } from "@/app/data/characters";
import { CharacterGrid } from "@/app/components/CharacterGrid";

export default function Home() {
  const characters = getAllCharacters();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Disney Bounding</h1>
      <p className="text-foreground/60 mb-10">Find color palettes to guide your Disney bounding outfits.</p>

      <CharacterGrid characters={characters} />
    </main>
  );
}
