import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { DELETE } from "./route";

const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const createdIds: string[] = [];
let ownerUserId: string;
let ownerCookie: string;
let otherUserId: string;
let otherCookie: string;

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const ownerUser = await adminPb.collection("users").create({
    email: "owner@example.com",
    emailVisibility: true,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
  });
  ownerUserId = ownerUser.id;
  const ownerPb = await adminPb.collection("users").impersonate(ownerUserId, 3600);
  ownerCookie = ownerPb.authStore.exportToCookie().split(";")[0];

  const otherUser = await adminPb.collection("users").create({
    email: "other@example.com",
    emailVisibility: true,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
  });
  otherUserId = otherUser.id;
  const otherPb = await adminPb.collection("users").impersonate(otherUserId, 3600);
  otherCookie = otherPb.authStore.exportToCookie().split(";")[0];
});

afterAll(async () => {
  for (const id of [ownerUserId, otherUserId]) {
    if (id) await adminPb.collection("users").delete(id).catch(() => {});
  }
});

afterEach(async () => {
  for (const id of createdIds) {
    await adminPb.collection("community_outfits").delete(id).catch(() => {});
  }
  createdIds.length = 0;
});

async function createOutfit(userId: string): Promise<string> {
  const content = new Uint8Array(3);
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  const image = new File([content], "photo.jpg", { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("character_slug", "ariel");
  formData.append("outfit_name", "Mermaid");
  formData.append("image", image);
  formData.append("status", "pending");
  formData.append("user", userId);

  const record = await adminPb.collection("community_outfits").create(formData);
  createdIds.push(record.id);
  return record.id;
}

function makeRequest(id: string, cookie?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (cookie) headers["Cookie"] = cookie;
  return new NextRequest(`http://localhost/api/community-outfits/${id}`, {
    method: "DELETE",
    headers,
  });
}

describe("DELETE /api/community-outfits/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const id = await createOutfit(ownerUserId);
    const res = await DELETE(makeRequest(id), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(401);
  });

  it("returns 204 and deletes the record when the owner requests it", async () => {
    const id = await createOutfit(ownerUserId);
    const res = await DELETE(makeRequest(id, ownerCookie), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(204);

    await expect(adminPb.collection("community_outfits").getOne(id)).rejects.toThrow();
    createdIds.splice(createdIds.indexOf(id), 1);
  });

  it("returns 403 when authenticated as a different user", async () => {
    const id = await createOutfit(ownerUserId);
    const res = await DELETE(makeRequest(id, otherCookie), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(403);
  });
});
