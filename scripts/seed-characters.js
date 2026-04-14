// Uploads all curated characters into the PocketBase characters collection.
//
// Run: node --env-file=.env.local scripts/seed-characters.js
//
// Requires in .env.local:
//   NEXT_PUBLIC_POCKETBASE_URL
//   PB_SUPERUSER_EMAIL
//   PB_SUPERUSER_PASSWORD
//
// Safe to re-run — skips characters whose slug already exists.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const characters = [
  {
    slug: "sadness/sweater",
    name: "Sadness",
    movie: "Inside Out",
    outfitName: "Sweater",
    imageSrc: "/characters/sadness/sweater.webp",
    imageAlt: "Sadness from Inside Out",
    cardColor: "#A0C0E0",
    colors: [
      { name: "Blue", oklch: { l: 0.568, c: 0.113, h: 256.1 }, usage: "Skin & hair — a medium blue top, turtleneck, or statement piece" },
      { name: "Ice Blue", oklch: { l: 0.876, c: 0.033, h: 254 }, usage: "Sweater — a pale blue or white chunky knit sweater or cardigan" },
      { name: "Navy", oklch: { l: 0.355, c: 0.134, h: 273.1 }, usage: "Pants — dark navy trousers, leggings, or a skirt" },
    ],
  },
  {
    slug: "bo-peep/adventure-outfit",
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
    slug: "ahsoka-tano/adult-outfit",
    name: "Ahsoka Tano",
    movie: "Star Wars: The Clone Wars",
    outfitName: "Adult Outfit",
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
    slug: "darth-vader/classic-armor",
    name: "Darth Vader",
    movie: "Star Wars",
    outfitName: "Classic Armor",
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
    slug: "jasmine/teal-outfit",
    name: "Jasmine",
    movie: "Aladdin",
    outfitName: "Teal Outfit",
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
    slug: "belle/ball-gown",
    name: "Belle",
    movie: "Beauty and the Beast",
    outfitName: "Ball Gown",
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
    slug: "cinderella/ball-gown",
    name: "Cinderella",
    movie: "Cinderella",
    outfitName: "Ball Gown",
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
    slug: "aurora/pink-dress",
    name: "Aurora",
    movie: "Sleeping Beauty",
    outfitName: "Pink Dress",
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
    slug: "snow-white/classic-dress",
    name: "Snow White",
    movie: "Snow White and the Seven Dwarfs",
    outfitName: "Classic Dress",
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
    slug: "ariel/mermaid",
    name: "Ariel",
    movie: "The Little Mermaid",
    outfitName: "Mermaid",
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
    slug: "ariel/princess-dress",
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
    slug: "rapunzel/tower-dress",
    name: "Rapunzel",
    movie: "Tangled",
    outfitName: "Tower Dress",
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
    slug: "flynn-rider/kingdom-outfit",
    name: "Flynn Rider",
    movie: "Tangled",
    outfitName: "Kingdom Outfit",
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
    slug: "judy-hopps/zpd-uniform",
    name: "Judy Hopps",
    movie: "Zootopia",
    outfitName: "ZPD Uniform",
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
    slug: "tinker-bell/leaf-dress",
    name: "Tinker Bell",
    movie: "Peter Pan",
    outfitName: "Leaf Dress",
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
    slug: "joy/yellow-dress",
    name: "Joy",
    movie: "Inside Out",
    outfitName: "Yellow Dress",
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

async function main() {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  const email = process.env.PB_SUPERUSER_EMAIL;
  const password = process.env.PB_SUPERUSER_PASSWORD;

  if (!url || !email || !password) {
    console.error("Missing required env vars: NEXT_PUBLIC_POCKETBASE_URL, PB_SUPERUSER_EMAIL, PB_SUPERUSER_PASSWORD");
    process.exit(1);
  }

  const pb = new PocketBase(url);
  await pb.collection("_superusers").authWithPassword(email, password);
  console.log("Authenticated as superuser");

  let created = 0;
  let skipped = 0;

  for (const character of characters) {
    // Check if slug already exists
    const existing = await pb.collection("characters").getFullList({
      filter: pb.filter("slug = {:slug}", { slug: character.slug }),
    });

    if (existing.length > 0) {
      console.log(`  skip  ${character.slug} (already exists)`);
      skipped++;
      continue;
    }

    const imagePath = resolve(projectRoot, "public", character.imageSrc.replace(/^\//, ""));
    const imageBuffer = readFileSync(imagePath);
    const imageFilename = character.imageSrc.split("/").pop();
    const imageBlob = new Blob([imageBuffer], { type: "image/webp" });

    const formData = new FormData();
    formData.append("slug", character.slug);
    formData.append("name", character.name);
    formData.append("movie", character.movie);
    formData.append("outfit_name", character.outfitName);
    formData.append("image", imageBlob, imageFilename);
    formData.append("image_alt", character.imageAlt);
    formData.append("card_color", character.cardColor);
    formData.append("colors", JSON.stringify(character.colors));
    formData.append("status", "approved");

    await pb.collection("characters").create(formData);
    console.log(`  ✓     ${character.slug}`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
