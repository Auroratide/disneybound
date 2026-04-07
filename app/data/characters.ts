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
    slug: "sadness",
    name: "Sadness",
    movie: "Inside Out",
    imageSrc: "/characters/sadness/render.webp",
    imageAlt: "Sadness from Inside Out",
    cardColor: "#A0C0E0",
    colors: [
      { name: "Blue", oklch: { l: 0.568, c: 0.113, h: 256.1 }, usage: "Skin & hair — a medium blue top, turtleneck, or statement piece" },
      { name: "Ice Blue", oklch: { l: 0.876, c: 0.033, h: 254 }, usage: "Sweater — a pale blue or white chunky knit sweater or cardigan" },
      { name: "Navy", oklch: { l: 0.355, c: 0.134, h: 273.1 }, usage: "Pants — dark navy trousers, leggings, or a skirt" },
    ],
  },
  {
    slug: "bo-peep",
    name: "Bo Peep",
    movie: "Toy Story 4",
    outfitName: "Adventure Outfit",
    imageSrc: "/characters/bo-peep/toy-story-4.webp",
    imageAlt: "Bo Peep in her Toy Story 4 adventure outfit",
    cardColor: "#C8E4EE",
    colors: [
      { name: "Light Blue", oklch: { l: 0.784, c: 0.048, h: 224.3 }, usage: "Jumpsuit — a powder or dusty blue jumpsuit, wide-leg trousers, or layered top" },
      { name: "Mauve", oklch: { l: 0.653, c: 0.092, h: 5.5 }, usage: "Hat & belt — a dusty rose hat, belt, or pink accessories" },
      { name: "Purple", oklch: { l: 0.376, c: 0.069, h: 301.6 }, usage: "Cape — a deep purple cape, cardigan, or dramatic outerwear" },
    ],
  },
  {
    slug: "ahsoka-tano",
    name: "Ahsoka Tano",
    movie: "Star Wars: The Clone Wars",
    imageSrc: "/characters/ahsoka-tano/adult.webp",
    imageAlt: "Ahsoka Tano in her adult outfit",
    cardColor: "#8AAABB",
    colors: [
      { name: "Blue-Gray", oklch: { l: 0.51, c: 0.032, h: 248.5 }, usage: "Armor & bodysuit — a slate blue-gray top, jacket, or structured vest" },
      { name: "Orange", oklch: { l: 0.596, c: 0.138, h: 45.1 }, usage: "Skin — a burnt orange top, wrap, or warm accent piece" },
      { name: "Cream", oklch: { l: 0.86, c: 0.023, h: 84.6 }, usage: "Markings — cream or off-white accessories, face paint inspiration, or light layering piece" },
    ],
  },
  {
    slug: "darth-vader",
    name: "Darth Vader",
    movie: "Star Wars",
    imageSrc: "/characters/darth-vader/darth-vader.webp",
    imageAlt: "Darth Vader with his red lightsaber",
    cardColor: "#404040",
    colors: [
      { name: "Black", oklch: { l: 0.209, c: 0.0, h: 89.9 }, usage: "Armor & cape — an all-black outfit, structured coat, or dramatic cape" },
      { name: "Red", oklch: { l: 0.539, c: 0.21, h: 28.1 }, usage: "Lightsaber — a red accessory, belt, or bold accent piece" },
      { name: "Gray", oklch: { l: 0.513, c: 0.016, h: 248.1 }, usage: "Chest panel — gray hardware details, a structured vest, or silver accessories" },
    ],
  },
  {
    slug: "jasmine",
    name: "Jasmine",
    movie: "Aladdin",
    imageSrc: "/characters/jasmine/dress.webp",
    imageAlt: "Jasmine in her teal outfit",
    cardColor: "#A8E8E0",
    colors: [
      { name: "Teal", oklch: { l: 0.793, c: 0.098, h: 188.7 }, usage: "Outfit — a teal or turquoise crop top, wide-leg pants, or flowy skirt" },
      { name: "Dark Teal", oklch: { l: 0.324, c: 0.064, h: 237.1 }, usage: "Hair — a dark teal or navy hair accessory, scrunchie, or headband" },
      { name: "Gold", oklch: { l: 0.723, c: 0.136, h: 88.9 }, usage: "Jewelry — gold earrings, a statement necklace, cuffs, or belt" },
    ],
  },
  {
    slug: "belle",
    name: "Belle",
    movie: "Beauty and the Beast",
    imageSrc: "/characters/belle/dress.webp",
    imageAlt: "Belle in her golden ball gown",
    cardColor: "#F5E080",
    colors: [
      { name: "Yellow", oklch: { l: 0.827, c: 0.163, h: 89.6 }, usage: "Dress — a golden yellow gown, skirt, or statement dress" },
      { name: "Brown", oklch: { l: 0.512, c: 0.09, h: 62.7 }, usage: "Hair — warm brown accessories, a cognac bag, or chestnut boots" },
      { name: "Red", oklch: { l: 0.535, c: 0.181, h: 25.8 }, usage: "Rose — a red floral accessory, brooch, or bold lip" },
    ],
  },
  {
    slug: "cinderella",
    name: "Cinderella",
    movie: "Cinderella",
    imageSrc: "/characters/cinderella/blue-dress.webp",
    imageAlt: "Cinderella in her blue ball gown",
    cardColor: "#B8E4F5",
    colors: [
      { name: "Sky Blue", oklch: { l: 0.79, c: 0.096, h: 223.8 }, usage: "Dress — a powder or sky blue gown, dress, or skirt" },
      { name: "Silver", oklch: { l: 0.935, c: 0.025, h: 218.8 }, usage: "Gloves & trim — white or silver gloves, sheer fabric, or sparkly accessories" },
      { name: "Gold", oklch: { l: 0.821, c: 0.147, h: 91 }, usage: "Hair — golden blonde hair accessories, a yellow headband, or gold jewelry" },
    ],
  },
  {
    slug: "aurora",
    name: "Aurora",
    movie: "Sleeping Beauty",
    imageSrc: "/characters/aurora/pink-dress.webp",
    imageAlt: "Aurora in her pink dress",
    cardColor: "#F5C0D0",
    colors: [
      { name: "Pink", oklch: { l: 0.71, c: 0.141, h: 2.4 }, usage: "Dress — a rose or blush pink dress, skirt, or gown" },
      { name: "Gold", oklch: { l: 0.828, c: 0.157, h: 88.7 }, usage: "Hair — golden blonde accessories, a yellow headband, or warm gold accents" },
      { name: "Red", oklch: { l: 0.538, c: 0.18, h: 20 }, usage: "Rose — a red floral accessory, brooch, or statement earrings" },
    ],
  },
  {
    slug: "snow-white",
    name: "Snow White",
    movie: "Snow White and the Seven Dwarfs",
    imageSrc: "/characters/snow-white/snow-white.webp",
    imageAlt: "Snow White in her iconic dress",
    cardColor: "#A8C8E8",
    colors: [
      { name: "Blue", oklch: { l: 0.549, c: 0.139, h: 254.2 }, usage: "Bodice — a royal blue top, corset, or jacket" },
      { name: "Yellow", oklch: { l: 0.854, c: 0.145, h: 92.7 }, usage: "Skirt — a golden yellow skirt, dress, or wide-leg trousers" },
      { name: "Red", oklch: { l: 0.524, c: 0.203, h: 21.6 }, usage: "Accents — a red bow, headband, cape, or statement accessory" },
    ],
  },
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
    imageSrc: "/characters/joy/render.webp",
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
