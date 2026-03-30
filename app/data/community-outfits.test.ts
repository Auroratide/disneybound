import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import PocketBase from "pocketbase";
import { getCommunityOutfits } from "./community-outfits";

// Admin client — needed to create records with arbitrary status and to delete after each test.
const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const TEST_SLUG = "_test_integration";
const TEST_OUTFIT = "Mermaid";

const createdIds: string[] = [];
let testUserId: string;

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const user = await adminPb.collection("users").create({
    email: "outfitdata-test@example.com",
    emailVisibility: true,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
    name: "Test Outfit User",
  });
  testUserId = user.id;
});

afterAll(async () => {
  if (testUserId) await adminPb.collection("users").delete(testUserId).catch(() => {});
});

afterEach(async () => {
  for (const id of createdIds) {
    try {
      await adminPb.collection("community_outfits").delete(id);
    } catch {
      // Record already gone — nothing to do.
    }
  }
  createdIds.length = 0;
});

function makeImage(name = "photo.jpg"): File {
  // PocketBase sniffs file bytes; JPEG magic bytes are required.
  const content = new Uint8Array(16);
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  return new File([content], name, { type: "image/jpeg" });
}

async function createRecord(fields: {
  character_slug: string;
  outfit_name: string;
  status: "pending" | "approved" | "rejected";
  user?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("character_slug", fields.character_slug);
  formData.append("outfit_name", fields.outfit_name);
  formData.append("image", makeImage());
  formData.append("status", fields.status);
  if (fields.user) {
    formData.append("user", fields.user);
  }
  const record = await adminPb.collection("community_outfits").create(formData);
  createdIds.push(record.id);
  return record.id;
}

describe("getCommunityOutfits", () => {
  it("returns an empty array when no approved records exist", async () => {
    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results).toEqual([]);
  });

  it("returns only approved records, not pending or rejected", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "pending" });
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "rejected" });
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved" });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results).toHaveLength(1);
  });

  it("filters by character_slug", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved" });
    await createRecord({ character_slug: "_test_other", outfit_name: TEST_OUTFIT, status: "approved" });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results).toHaveLength(1);
    expect(results[0].characterSlug).toBe(TEST_SLUG);
  });

  it("filters by outfit_name", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved" });
    await createRecord({ character_slug: TEST_SLUG, outfit_name: "_test_other_outfit", status: "approved" });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results).toHaveLength(1);
    expect(results[0].outfitName).toBe(TEST_OUTFIT);
  });

  it("maps snake_case record fields to camelCase", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved" });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results[0].characterSlug).toBe(TEST_SLUG);
    expect(results[0].outfitName).toBe(TEST_OUTFIT);
  });

  it("returns a valid PocketBase file URL for imageUrl", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved" });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results[0].imageUrl).toMatch(/^http.*\/api\/files\//);
  });

  it("returns the user's name when the user has a name set", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved", user: testUserId });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results[0].userName).toBe("Test Outfit User");
  });

  it("sets userId to the owner's id when a user is set", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved", user: testUserId });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results[0].userId).toBe(testUserId);
  });

  it("sets userId to null for orphaned records with no user", async () => {
    await createRecord({ character_slug: TEST_SLUG, outfit_name: TEST_OUTFIT, status: "approved" });

    const results = await getCommunityOutfits(TEST_SLUG, TEST_OUTFIT);
    expect(results[0].userId).toBeNull();
  });
});
