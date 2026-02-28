import { NextRequest, NextResponse } from "next/server";
import { getPocketbase } from "@/lib/pocketbase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const pb = getPocketbase();
  pb.authStore.loadFromCookie(request.headers.get("cookie") ?? "");
  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const characterSlug = formData.get("character_slug");
  const outfitName = formData.get("outfit_name");
  const image = formData.get("image");
  const submitterName = formData.get("submitter_name");

  if (!characterSlug || typeof characterSlug !== "string" || !characterSlug.trim()) {
    return NextResponse.json({ error: "character_slug is required" }, { status: 400 });
  }

  if (!outfitName || typeof outfitName !== "string" || !outfitName.trim()) {
    return NextResponse.json({ error: "outfit_name is required" }, { status: 400 });
  }

  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(image.type)) {
    return NextResponse.json(
      { error: "Image must be a JPEG, PNG, or WebP" },
      { status: 400 }
    );
  }

  if (image.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image must be smaller than 5 MB" },
      { status: 400 }
    );
  }

  const pbFormData = new FormData();
  pbFormData.append("character_slug", characterSlug.trim());
  pbFormData.append("outfit_name", outfitName.trim());
  pbFormData.append("image", image);
  pbFormData.append("status", "pending");
  pbFormData.append("user", pb.authStore.record!.id);

  if (submitterName && typeof submitterName === "string" && submitterName.trim()) {
    pbFormData.append("submitter_name", submitterName.trim());
  }

  try {
    const record = await pb.collection("community_outfits").create(pbFormData);
    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (err) {
    console.error("Failed to create community outfit:", err);
    return NextResponse.json({ error: "Failed to submit outfit" }, { status: 500 });
  }
}
