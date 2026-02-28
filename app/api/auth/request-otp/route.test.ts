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
  return new NextRequest("http://localhost/api/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/request-otp", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is blank", async () => {
    const res = await POST(makeRequest({ email: "   " }));
    expect(res.status).toBe(400);
  });

  it("creates a new user and returns an otpId for an unknown email", async () => {
    const email = "new-otp-test@example.com";
    createdEmails.push(email);

    const res = await POST(makeRequest({ email }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.otpId).toBe("string");
    expect(body.otpId.length).toBeGreaterThan(0);

    // Verify the user was actually created.
    const records = await adminPb.collection("users").getFullList({
      filter: adminPb.filter("email = {:email}", { email }),
    });
    expect(records).toHaveLength(1);
  });

  it("returns an otpId for an existing user without creating a duplicate", async () => {
    const email = "existing-otp-test@example.com";
    createdEmails.push(email);

    const password = crypto.randomUUID();
    await adminPb.collection("users").create({
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
    });

    const res = await POST(makeRequest({ email }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.otpId).toBe("string");

    // Verify no duplicate was created.
    const records = await adminPb.collection("users").getFullList({
      filter: adminPb.filter("email = {:email}", { email }),
    });
    expect(records).toHaveLength(1);
  });
});
