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

  // Use the admin client to create the user if they don't already exist.
  // requestOTP only sends an email to existing users (returns a fake otpId
  // for unknown emails), so we ensure the account exists first.
  const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const existing = await adminPb.collection("users").getFullList({
    filter: adminPb.filter("email = {:email}", { email: trimmedEmail }),
  });

  if (existing.length === 0) {
    const password = crypto.randomUUID();
    await adminPb.collection("users").create({
      email: trimmedEmail,
      emailVisibility: true,
      password,
      passwordConfirm: password,
    });
  }

  // Request the OTP via an unauthenticated client (public endpoint).
  const pb = getPocketbase();
  try {
    const result = await pb.collection("users").requestOTP(trimmedEmail);
    return NextResponse.json({ otpId: result.otpId });
  } catch (err) {
    console.error("Failed to request OTP:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
