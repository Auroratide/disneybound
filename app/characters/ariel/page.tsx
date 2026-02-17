import type { Metadata } from "next";
import Outfit from "@/app/components/Outfit";
import type { OutfitColor } from "@/app/components/Outfit";

export const metadata: Metadata = {
  title: "Ariel - Disney Bounding",
  description: "Disney Bounding color guide for Ariel from The Little Mermaid",
};

const mermaidColors: OutfitColor[] = [
  { name: "Red", hex: "#C41230", usage: "Hair — a bold red top, headband, or accent" },
  { name: "Lavender", hex: "#9B59B6", usage: "Seashell top — a purple or lavender top" },
  { name: "Seafoam Green", hex: "#3CB371", usage: "Tail — a green skirt or pants" },
];

const princessDressColors: OutfitColor[] = [
  { name: "Red", hex: "#C41230", usage: "Hair — a bold red top, headband, or accent" },
  { name: "Pink", hex: "#F0A1BF", usage: "Dress — a sparkly or shimmery pink dress or skirt" },
  { name: "Light Blue", hex: "#87CEEB", usage: "Bow and trim — a blue sash, belt, or accessory" },
];

export default function ArielPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-sm text-foreground/60 mb-2">The Little Mermaid</p>
      <h1 className="text-4xl font-bold mb-6">Ariel</h1>

      <Outfit
        name="Mermaid"
        imageSrc="/characters/ariel/mermaid.webp"
        imageAlt="Ariel as a Mermaid"
        colors={mermaidColors}
      />
      <Outfit
        name="Princess Dress"
        imageSrc="/characters/ariel/princess-dress.webp"
        imageAlt="Ariel in her Princess Dress"
        colors={princessDressColors}
      />
    </main>
  );
}
