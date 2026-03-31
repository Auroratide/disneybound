import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const username = body?.username;

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (!username || typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();

  const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const existing = await adminPb.collection("users").getFullList({
    filter: adminPb.filter("email = {:email}", { email: trimmedEmail }),
  });

  if (existing.length > 0 && existing[0].verified === true) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  if (existing.length > 0) {
    // Unverified dangling account — update the username and reuse it.
    await adminPb.collection("users").update(existing[0].id, {
      name: trimmedUsername,
    });
  } else {
    const password = crypto.randomUUID();
    await adminPb.collection("users").create({
      email: trimmedEmail,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      name: trimmedUsername,
      verified: false,
    });
  }

  const pb = getPocketbase();
  try {
    const result = await pb.collection("users").requestOTP(trimmedEmail);
    return NextResponse.json({ otpId: result.otpId });
  } catch (err) {
    console.error("Failed to request OTP:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
