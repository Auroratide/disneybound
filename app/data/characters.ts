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
  {
    slug: "flynn-rider",
    name: "Flynn Rider",
    movie: "Tangled",
    outfits: [
      {
        name: "Kingdom Outfit",
        imageSrc: "/characters/flynn-rider/kingdom-outfit.webp",
        imageAlt: "Flynn Rider in his Kingdom Outfit",
        cardColor: "#C4A882",
        colors: [
          { name: "Brown", hex: "#8B6347", usage: "Vest — a brown or leather-look vest or jacket" },
          { name: "Cream", hex: "#F5EDDC", usage: "Shirt — a loose cream or off-white billowy top" },
          { name: "Teal", hex: "#4A7C8E", usage: "Pants — dark teal or slate blue trousers" },
        ],
      },
    ],
  },
  {
    slug: "joy",
    name: "Joy",
    movie: "Inside Out",
    outfits: [
      {
        name: "Joy's Outfit",
        imageSrc: "/characters/joy/joys-outfit.webp",
        imageAlt: "Joy from Inside Out",
        cardColor: "#FFE566",
        colors: [
          { name: "Yellow", hex: "#FFD700", usage: "Dress — a bright yellow dress, skirt, or jumpsuit" },
          { name: "Blue", hex: "#5B9BD5", usage: "Accents — a blue hair flower, cardigan, or bag" },
          { name: "White", hex: "#F0F0F0", usage: "Sparkle details — white jewelry, star accessories, or a shimmery belt" },
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
