import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { POST } from "./route";

const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const createdEmails: string[] = [];

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );
});

afterEach(async () => {
  for (const email of createdEmails) {
    try {
      const records = await adminPb.collection("users").getFullList({
        filter: adminPb.filter("email = {:email}", { email }),
      });
      for (const record of records) {
        await adminPb.collection("users").delete(record.id);
      }
    } catch {
      // Already gone — nothing to do.
    }
  }
  createdEmails.length = 0;
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/confirm-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function createUser(email: string, { verified = false, name = "" } = {}) {
  const password = crypto.randomUUID();
  const record = await adminPb.collection("users").create({
    email,
    emailVisibility: true,
    password,
    passwordConfirm: password,
    verified,
    name,
  });
  createdEmails.push(email);
  return record;
}

/** Requests an OTP for the given email and returns the otpId. */
async function requestOtp(email: string): Promise<string> {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  const result = await pb.collection("users").requestOTP(email);
  return result.otpId;
}

/**
 * Reads the most recent OTP code from Mailpit for the given email address.
 * Mailpit is the local SMTP dev server used in tests.
 */
async function readOtpFromMailpit(email: string): Promise<string> {
  const mailpitUrl = process.env.MAILPIT_URL ?? "http://localhost:8025";
  const res = await fetch(`${mailpitUrl}/api/v1/messages`);
  const data = await res.json() as { messages: Array<{ ID: string; To: Array<{ Address: string }> }> };

  const message = data.messages.find((m) =>
    m.To.some((t) => t.Address === email)
  );
  if (!message) throw new Error(`No Mailpit message found for ${email}`);

  const msgRes = await fetch(`${mailpitUrl}/api/v1/message/${message.ID}`);
  const msgData = await msgRes.json() as { Text: string };

  const match = msgData.Text.match(/\b(\d{6})\b/);
  if (!match) throw new Error("Could not find 6-digit OTP code in email body");
  return match[1];
}

describe("POST /api/auth/confirm-otp", () => {
  it("returns 400 when otpId is missing", async () => {
    const res = await POST(makeRequest({ code: "123456" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when code is missing", async () => {
    const res = await POST(makeRequest({ otpId: "some-id" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 for an invalid code", async () => {
    const res = await POST(makeRequest({ otpId: "fake-otp-id", code: "000000" }));
    expect(res.status).toBe(401);
  });

  it("returns a token and record on success, and flips verified to true for a new user", async () => {
    const email = "confirm-otp-verify@example.com";
    await createUser(email, { verified: false, name: "NewUser" });

    const otpId = await requestOtp(email);
    const code = await readOtpFromMailpit(email);

    const res = await POST(makeRequest({ otpId, code }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.token).toBe("string");
    expect(body.record.email).toBe(email);

    // verified should now be true
    expect(body.record.verified).toBe(true);

    // Confirm it was persisted in the DB too.
    const records = await adminPb.collection("users").getFullList({
      filter: adminPb.filter("email = {:email}", { email }),
    });
    expect(records[0].verified).toBe(true);
  });
});
