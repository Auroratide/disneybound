import type { OklchColor } from "@/app/lib/color-matching";

export type OutfitColor = {
  name: string;
  oklch: OklchColor;
  usage: string;
};

export type Character = {
  slug: string;
  name: string;
  movie: string;
  outfitName?: string;
  imageSrc: string;
  imageAlt: string;
  cardColor: string;
  colors: OutfitColor[];
};

const characters: Character[] = [
  {
    slug: "ariel",
    name: "Ariel",
    movie: "The Little Mermaid",
    imageSrc: "/characters/ariel/mermaid.webp",
    imageAlt: "Ariel as a Mermaid",
    cardColor: "#B8E8D8",
    colors: [
      { name: "Red", oklch: { l: 0.524, c: 0.203, h: 21.6 }, usage: "Hair — a bold red top, headband, or accent" },
      { name: "Lavender", oklch: { l: 0.577, c: 0.152, h: 315.3 }, usage: "Seashell top — a purple or lavender top" },
      { name: "Seafoam Green", oklch: { l: 0.684, c: 0.144, h: 155 }, usage: "Tail — a green skirt or pants" },
    ],
  },
  {
    slug: "ariel-princess-dress",
    name: "Ariel",
    movie: "The Little Mermaid",
    outfitName: "Princess Dress",
    imageSrc: "/characters/ariel/princess-dress.webp",
    imageAlt: "Ariel in her Princess Dress",
    cardColor: "#F5C6D8",
    colors: [
      { name: "Red", oklch: { l: 0.524, c: 0.203, h: 21.6 }, usage: "Hair — a bold red top, headband, or accent" },
      { name: "Pink", oklch: { l: 0.795, c: 0.1, h: 355.2 }, usage: "Dress — a sparkly or shimmery pink dress or skirt" },
      { name: "Light Blue", oklch: { l: 0.815, c: 0.082, h: 225.8 }, usage: "Bow and trim — a blue sash, belt, or accessory" },
    ],
  },
  {
    slug: "rapunzel",
    name: "Rapunzel",
    movie: "Tangled",
    imageSrc: "/characters/rapunzel/tower-dress.webp",
    imageAlt: "Rapunzel in her Tower Dress",
    cardColor: "#DDD0F5",
    colors: [
      { name: "Gold", oklch: { l: 0.887, c: 0.182, h: 95.3 }, usage: "Hair — long golden accessories, a blonde wig, or yellow accents" },
      { name: "Lavender", oklch: { l: 0.657, c: 0.133, h: 297.5 }, usage: "Dress — a purple or lavender dress, skirt, or top" },
      { name: "Pink", oklch: { l: 0.784, c: 0.094, h: 352 }, usage: "Lacing — pink accents, a corset detail, or belt" },
    ],
  },
  {
    slug: "flynn-rider",
    name: "Flynn Rider",
    movie: "Tangled",
    imageSrc: "/characters/flynn-rider/kingdom-outfit.webp",
    imageAlt: "Flynn Rider in his Kingdom Outfit",
    cardColor: "#C4A882",
    colors: [
      { name: "Brown", oklch: { l: 0.534, c: 0.066, h: 55.8 }, usage: "Vest — a brown or leather-look vest or jacket" },
      { name: "Cream", oklch: { l: 0.948, c: 0.024, h: 85.8 }, usage: "Shirt — a loose cream or off-white billowy top" },
      { name: "Teal", oklch: { l: 0.558, c: 0.061, h: 223.1 }, usage: "Pants — dark teal or slate blue trousers" },
    ],
  },
  {
    slug: "judy-hopps",
    name: "Judy Hopps",
    movie: "Zootopia",
    imageSrc: "/characters/judy-hopps/judy-hopps.webp",
    imageAlt: "Judy Hopps in her ZPD police uniform",
    cardColor: "#A8C4E0",
    colors: [
      { name: "Dark Navy", oklch: { l: 0.403, c: 0.089, h: 259.4 }, usage: "Vest — a dark navy jacket, vest, or structured top" },
      { name: "Blue", oklch: { l: 0.571, c: 0.11, h: 258.6 }, usage: "Uniform — a medium blue long-sleeve top or trousers" },
      { name: "Gray", oklch: { l: 0.705, c: 0.019, h: 264.4 }, usage: "Fur — a gray cardigan, turtleneck, or neutral layer" },
    ],
  },
  {
    slug: "tinker-bell",
    name: "Tinker Bell",
    movie: "Peter Pan",
    imageSrc: "/characters/tinker-bell/tinker-bell.webp",
    imageAlt: "Tinker Bell",
    cardColor: "#C8E6A0",
    colors: [
      { name: "Green", oklch: { l: 0.671, c: 0.179, h: 136.8 }, usage: "Dress — a bright leaf-green dress, skirt, or top" },
      { name: "Gold", oklch: { l: 0.821, c: 0.147, h: 91 }, usage: "Hair — golden blonde accessories, a yellow headband, or fairy dust accents" },
      { name: "White", oklch: { l: 0.955, c: 0.0, h: 89.9 }, usage: "Wings — white or iridescent accents, sheer fabric, or sparkly jewelry" },
    ],
  },
  {
    slug: "joy",
    name: "Joy",
    movie: "Inside Out",
    imageSrc: "/characters/joy/joys-outfit.webp",
    imageAlt: "Joy from Inside Out",
    cardColor: "#FFE566",
    colors: [
      { name: "Yellow", oklch: { l: 0.887, c: 0.182, h: 95.3 }, usage: "Dress — a bright yellow dress, skirt, or jumpsuit" },
      { name: "Blue", oklch: { l: 0.671, c: 0.109, h: 247.5 }, usage: "Accents — a blue hair flower, cardigan, or bag" },
      { name: "White", oklch: { l: 0.955, c: 0.0, h: 89.9 }, usage: "Sparkle details — white jewelry, star accessories, or a shimmery belt" },
    ],
  },
];

export function getAllCharacters(): Character[] {
  return characters;
}

export function getCharacterBySlug(slug: string): Character | undefined {
  return characters.find((c) => c.slug === slug);
}
