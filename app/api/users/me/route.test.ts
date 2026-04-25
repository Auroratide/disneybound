import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { PATCH } from "./route";

const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

let testUserId: string;
let userCookie: string;

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const testUser = await adminPb.collection("users").create({
    email: "profile-test@example.com",
    emailVisibility: true,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
    name: "Original Name",
  });
  testUserId = testUser.id;

  const userPb = await adminPb.collection("users").impersonate(testUserId, 3600);
  userCookie = userPb.authStore.exportToCookie().split(";")[0];
});

afterAll(async () => {
  if (testUserId) {
    await adminPb.collection("users").delete(testUserId).catch(() => {});
  }
});

function makeRequest(fields: Record<string, string | File>, cookie?: string): NextRequest {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  const headers: Record<string, string> = {};
  if (cookie) headers["Cookie"] = cookie;
  return new NextRequest("http://localhost/api/users/me", {
    method: "PATCH",
    body: formData,
    headers,
  });
}

function makeAvatar(name = "avatar.jpg", type = "image/jpeg", sizeBytes = 16): File {
  const content = new Uint8Array(Math.max(sizeBytes, 3));
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  return new File([content], name, { type });
}

describe("PATCH /api/users/me", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await PATCH(makeRequest({ name: "New Name" }));
    expect(res.status).toBe(401);
  });

  it("updates the display name and returns 200 with the new name", async () => {
    const res = await PATCH(makeRequest({ name: "Updated Name" }, userCookie));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated Name");

    const record = await adminPb.collection("users").getOne(testUserId);
    expect(record.name).toBe("Updated Name");
  });

  it("returns 400 when name is an empty string", async () => {
    const res = await PATCH(makeRequest({ name: "   " }, userCookie));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name exceeds 100 characters", async () => {
    const res = await PATCH(makeRequest({ name: "a".repeat(101) }, userCookie));
    expect(res.status).toBe(400);
  });

  it("updates the avatar and returns 200 with an avatarUrl", async () => {
    const res = await PATCH(makeRequest({ avatar: makeAvatar() }, userCookie));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.avatarUrl).toBe("string");
    expect(body.avatarUrl).toContain("avatar");
  });

  it("returns 400 when avatar is the wrong file type", async () => {
    const res = await PATCH(makeRequest({ avatar: makeAvatar("doc.pdf", "application/pdf") }, userCookie));
    expect(res.status).toBe(400);
  });

  it("returns 400 when avatar exceeds 5 MB", async () => {
    const res = await PATCH(makeRequest(
      { avatar: makeAvatar("big.jpg", "image/jpeg", 5 * 1024 * 1024 + 1) },
      userCookie
    ));
    expect(res.status).toBe(400);
  });
});
