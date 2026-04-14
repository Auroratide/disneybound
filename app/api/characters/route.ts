import { NextRequest, NextResponse } from "next/server";
import { getPocketbase } from "@/lib/pocketbase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toSlug(name: string, outfitName: string): string {
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slugify(name)}/${slugify(outfitName)}`;
}

export async function POST(request: NextRequest) {
  const pb = getPocketbase();
  pb.authStore.loadFromCookie(request.headers.get("cookie") ?? "");
  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const name = formData.get("name");
  const movie = formData.get("movie");
  const outfitName = formData.get("outfit_name");
  const colorsJson = formData.get("colors");
  const image = formData.get("image");

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!movie || typeof movie !== "string" || !movie.trim()) {
    return NextResponse.json({ error: "movie is required" }, { status: 400 });
  }
  if (!outfitName || typeof outfitName !== "string" || !outfitName.trim()) {
    return NextResponse.json({ error: "outfit_name is required" }, { status: 400 });
  }
  if (!colorsJson || typeof colorsJson !== "string") {
    return NextResponse.json({ error: "colors is required" }, { status: 400 });
  }
  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(image.type)) {
    return NextResponse.json({ error: "Image must be a JPEG, PNG, or WebP" }, { status: 400 });
  }
  if (image.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be smaller than 5 MB" }, { status: 400 });
  }

  let colors: unknown;
  try {
    colors = JSON.parse(colorsJson);
    if (!Array.isArray(colors) || colors.length !== 3) throw new Error();
  } catch {
    return NextResponse.json({ error: "colors must be an array of 3 entries" }, { status: 400 });
  }

  const slug = toSlug(name, outfitName);

  // Enforce uniqueness — reject if slug already exists (curated or previously submitted).
  const existing = await pb.collection("characters").getFullList({
    filter: pb.filter("slug = {:slug}", { slug }),
  });
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "This character outfit already exists.", slug },
      { status: 409 }
    );
  }

  const pbFormData = new FormData();
  pbFormData.append("slug", slug);
  pbFormData.append("name", name.trim());
  pbFormData.append("movie", movie.trim());
  pbFormData.append("outfit_name", outfitName.trim());
  pbFormData.append("colors", JSON.stringify(colors));
  pbFormData.append("image", image);
  pbFormData.append("image_alt", `${name.trim()} — ${outfitName.trim()}`);
  pbFormData.append("card_color", "#cccccc");
  pbFormData.append("status", "pending");
  pbFormData.append("submitted_by", pb.authStore.record!.id);

  try {
    const record = await pb.collection("characters").create(pbFormData);
    return NextResponse.json({ id: record.id, slug }, { status: 201 });
  } catch (err) {
    console.error("Failed to create character:", err);
    return NextResponse.json({ error: "Failed to submit character" }, { status: 500 });
  }
}
