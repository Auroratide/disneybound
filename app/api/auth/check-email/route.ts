import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const trimmedEmail = email.trim();

  const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const existing = await adminPb.collection("users").getFullList({
    filter: adminPb.filter("email = {:email}", { email: trimmedEmail }),
  });

  const isVerified = existing.length > 0 && existing[0].verified === true;

  if (!isVerified) {
    return NextResponse.json({ status: "new" });
  }

  const pb = getPocketbase();
  try {
    const result = await pb.collection("users").requestOTP(trimmedEmail);
    return NextResponse.json({
      status: "existing",
      otpId: result.otpId,
      username: existing[0].name as string,
    });
  } catch (err) {
    console.error("Failed to request OTP:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
