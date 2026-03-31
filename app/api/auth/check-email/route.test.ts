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
  return new NextRequest("http://localhost/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function createUser(email: string, { verified = false, name = "" } = {}) {
  const password = crypto.randomUUID();
  await adminPb.collection("users").create({
    email,
    emailVisibility: true,
    password,
    passwordConfirm: password,
    verified,
    name,
  });
  createdEmails.push(email);
}

describe("POST /api/auth/check-email", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is blank", async () => {
    const res = await POST(makeRequest({ email: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns { status: 'new' } for an unknown email", async () => {
    const res = await POST(makeRequest({ email: "unknown-check-email@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("new");
    expect(body.otpId).toBeUndefined();
  });

  it("returns { status: 'new' } for an unverified (dangling) account", async () => {
    const email = "unverified-check-email@example.com";
    await createUser(email, { verified: false, name: "Dangling User" });

    const res = await POST(makeRequest({ email }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("new");
    expect(body.otpId).toBeUndefined();
  });

  it("returns { status: 'existing', otpId, username } for a verified account", async () => {
    const email = "verified-check-email@example.com";
    await createUser(email, { verified: true, name: "Verified User" });

    const res = await POST(makeRequest({ email }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("existing");
    expect(typeof body.otpId).toBe("string");
    expect(body.otpId.length).toBeGreaterThan(0);
    expect(body.username).toBe("Verified User");
  });
});
