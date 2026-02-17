export type OutfitColor = {
  name: string;
  hex: string;
  usage: string;
};

export type Outfit = {
  name: string;
  imageSrc: string;
  imageAlt: string;
  cardColor: string;
  colors: OutfitColor[];
};

export type Character = {
  slug: string;
  name: string;
  movie: string;
  outfits: Outfit[];
};

const characters: Character[] = [
  {
    slug: "ariel",
    name: "Ariel",
    movie: "The Little Mermaid",
    outfits: [
      {
        name: "Mermaid",
        imageSrc: "/characters/ariel/mermaid.webp",
        imageAlt: "Ariel as a Mermaid",
        cardColor: "#B8E8D8",
        colors: [
          { name: "Red", hex: "#C41230", usage: "Hair — a bold red top, headband, or accent" },
          { name: "Lavender", hex: "#9B59B6", usage: "Seashell top — a purple or lavender top" },
          { name: "Seafoam Green", hex: "#3CB371", usage: "Tail — a green skirt or pants" },
        ],
      },
      {
        name: "Princess Dress",
        imageSrc: "/characters/ariel/princess-dress.webp",
        imageAlt: "Ariel in her Princess Dress",
        cardColor: "#F5C6D8",
        colors: [
          { name: "Red", hex: "#C41230", usage: "Hair — a bold red top, headband, or accent" },
          { name: "Pink", hex: "#F0A1BF", usage: "Dress — a sparkly or shimmery pink dress or skirt" },
          { name: "Light Blue", hex: "#87CEEB", usage: "Bow and trim — a blue sash, belt, or accessory" },
        ],
      },
    ],
  },
  {
    slug: "rapunzel",
    name: "Rapunzel",
    movie: "Tangled",
    outfits: [
      {
        name: "Tower Dress",
        imageSrc: "/characters/rapunzel/tower-dress.webp",
        imageAlt: "Rapunzel in her Tower Dress",
        cardColor: "#DDD0F5",
        colors: [
          { name: "Gold", hex: "#FFD700", usage: "Hair — long golden accessories, a blonde wig, or yellow accents" },
          { name: "Lavender", hex: "#9B7ED8", usage: "Dress — a purple or lavender dress, skirt, or top" },
          { name: "Pink", hex: "#E8A0BF", usage: "Lacing — pink accents, a corset detail, or belt" },
        ],
      },
    ],
  },
];

export function getAllCharacters(): Character[] {
  return characters;
}

export function getCharacterBySlug(slug: string): Character | undefined {
  return characters.find((c) => c.slug === slug);
}
