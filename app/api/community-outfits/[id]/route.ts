import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPocketbase, getAdminPocketbase } from "@/lib/pocketbase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userPb = getPocketbase();
  userPb.authStore.loadFromCookie(request.headers.get("cookie") ?? "");
  if (!userPb.authStore.isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = userPb.authStore.record!.id;

  const adminPb = await getAdminPocketbase();

  let outfit: { user: string; character_slug: string };
  try {
    outfit = await adminPb.collection("community_outfits").getOne(id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (outfit.user !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await adminPb.collection("community_outfits").delete(id);
  revalidatePath(`/characters/${outfit.character_slug}`);
  return new NextResponse(null, { status: 204 });
}
