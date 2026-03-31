import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { otpId, code } = body ?? {};

  if (!otpId || typeof otpId !== "string") {
    return NextResponse.json({ error: "otpId is required" }, { status: 400 });
  }
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const pb = getPocketbase();
  try {
    await pb.collection("users").authWithOTP(otpId, code);
  } catch {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  const token = pb.authStore.token;
  let record = pb.authStore.record;

  // First-time login: flip verified to true so the account is no longer treated as new.
  if (record && record.verified === false) {
    const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    await adminPb.collection("_superusers").authWithPassword(
      process.env.PB_SUPERUSER_EMAIL!,
      process.env.PB_SUPERUSER_PASSWORD!
    );
    record = await adminPb.collection("users").update(record.id, { verified: true });
  }

  const response = NextResponse.json({ token, record });

  const cookie = pb.authStore.exportToCookie({ sameSite: "lax" });
  response.headers.append("Set-Cookie", cookie);

  return response;
}
