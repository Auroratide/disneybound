import { NextRequest, NextResponse } from "next/server";
import { getPocketbase, getAdminPocketbase } from "@/lib/pocketbase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_NAME_LENGTH = 100;

export async function PATCH(request: NextRequest) {
  const userPb = getPocketbase();
  userPb.authStore.loadFromCookie(request.headers.get("cookie") ?? "");
  if (!userPb.authStore.isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = userPb.authStore.record!.id;

  const formData = await request.formData();
  const name = formData.get("name");
  const avatar = formData.get("avatar");

  if (name !== null) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `name must be ${MAX_NAME_LENGTH} characters or fewer` }, { status: 400 });
    }
  }

  if (avatar !== null) {
    if (!(avatar instanceof File)) {
      return NextResponse.json({ error: "avatar must be a file" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(avatar.type)) {
      return NextResponse.json({ error: "avatar must be a JPEG, PNG, or WebP" }, { status: 400 });
    }
    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "avatar must be smaller than 5 MB" }, { status: 400 });
    }
  }

  const adminPb = await getAdminPocketbase();
  const updateData = new FormData();
  if (name !== null) updateData.append("name", (name as string).trim());
  if (avatar !== null) updateData.append("avatar", avatar as File);

  try {
    const updated = await adminPb.collection("users").update(userId, updateData);
    const avatarUrl = updated.avatar
      ? adminPb.files.getURL(updated, updated.avatar)
      : null;
    return NextResponse.json({ name: updated.name, avatarUrl, avatarFilename: updated.avatar ?? null }, { status: 200 });
  } catch (err) {
    console.error("Failed to update profile:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
