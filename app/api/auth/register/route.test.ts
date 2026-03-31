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
  return new NextRequest("http://localhost/api/auth/register", {
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

describe("POST /api/auth/register", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ username: "Mickey" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is blank", async () => {
    const res = await POST(makeRequest({ email: "   ", username: "Mickey" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is missing", async () => {
    const res = await POST(makeRequest({ email: "new-register@example.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is blank", async () => {
    const res = await POST(makeRequest({ email: "new-register@example.com", username: "   " }));
    expect(res.status).toBe(400);
  });

  it("creates a new account and returns otpId for an unknown email", async () => {
    const email = "new-register@example.com";
    createdEmails.push(email);

    const res = await POST(makeRequest({ email, username: "NewUser" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.otpId).toBe("string");
    expect(body.otpId.length).toBeGreaterThan(0);

    const records = await adminPb.collection("users").getFullList({
      filter: adminPb.filter("email = {:email}", { email }),
    });
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe("NewUser");
    expect(records[0].verified).toBe(false);
  });

  it("reuses the dangling unverified account and updates the username", async () => {
    const email = "dangling-register@example.com";
    const original = await createUser(email, { verified: false, name: "OldName" });

    const res = await POST(makeRequest({ email, username: "NewName" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.otpId).toBe("string");

    const records = await adminPb.collection("users").getFullList({
      filter: adminPb.filter("email = {:email}", { email }),
    });
    // No duplicate created.
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(original.id);
    expect(records[0].name).toBe("NewName");
  });

  it("returns 409 for an already-verified account", async () => {
    const email = "verified-register@example.com";
    await createUser(email, { verified: true, name: "ExistingUser" });

    const res = await POST(makeRequest({ email, username: "TryAgain" }));
    expect(res.status).toBe(409);
  });
});
