import { NextRequest, NextResponse } from "next/server";
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
  const record = pb.authStore.record;

  const response = NextResponse.json({ token, record });

  const cookie = pb.authStore.exportToCookie({ sameSite: "lax" })
  response.headers.append("Set-Cookie", cookie)

  return response;
}
