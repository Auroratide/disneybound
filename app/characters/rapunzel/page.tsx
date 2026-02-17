import type { Metadata } from "next";
import Outfit from "@/app/components/Outfit";
import type { OutfitColor } from "@/app/components/Outfit";

export const metadata: Metadata = {
  title: "Rapunzel - Disney Bounding",
  description: "Disney Bounding color guide for Rapunzel from Tangled",
};

const towerDressColors: OutfitColor[] = [
  { name: "Gold", hex: "#FFD700", usage: "Hair — long golden accessories, a blonde wig, or yellow accents" },
  { name: "Lavender", hex: "#9B7ED8", usage: "Dress — a purple or lavender dress, skirt, or top" },
  { name: "Pink", hex: "#E8A0BF", usage: "Lacing — pink accents, a corset detail, or belt" },
];

export default function RapunzelPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-sm text-foreground/60 mb-2">Tangled</p>
      <h1 className="text-4xl font-bold mb-6">Rapunzel</h1>

      <Outfit
        name="Tower Dress"
        imageSrc="/characters/rapunzel/tower-dress.webp"
        imageAlt="Rapunzel in her Tower Dress"
        colors={towerDressColors}
      />
    </main>
  );
}
