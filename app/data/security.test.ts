import { describe, it, expect, beforeAll, afterAll } from "vitest";
import PocketBase, { ClientResponseError } from "pocketbase";

// Admin client for setup/teardown only.
const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Unauthenticated client — represents an anonymous attacker probing the API.
const anonPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

let victimUserId: string;
let attackerUserId: string;
let attackerPb: PocketBase; // authenticated as a different regular user

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  // "Victim" user whose data we want to ensure is protected.
  const victim = await adminPb.collection("users").create({
    email: "security-victim@example.com",
    emailVisibility: false,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
    name: "Victim User",
  });
  victimUserId = victim.id;

  // "Attacker" user — authenticated, but as a different account.
  const attacker = await adminPb.collection("users").create({
    email: "security-attacker@example.com",
    emailVisibility: false,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
    name: "Attacker User",
  });
  attackerUserId = attacker.id;
  attackerPb = await adminPb.collection("users").impersonate(attackerUserId, 3600);
});

afterAll(async () => {
  await adminPb.collection("users").delete(victimUserId).catch(() => {});
  await adminPb.collection("users").delete(attackerUserId).catch(() => {});
});

describe("users collection — anonymous attacker", () => {
  it("cannot list all users", async () => {
    await expect(
      anonPb.collection("users").getList()
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot retrieve a user's email by ID when emailVisibility is false", async () => {
    const record = await anonPb.collection("users").getOne(victimUserId);
    // PocketBase omits the email field entirely for hidden emails.
    expect(record.email).toBeFalsy();
  });
});

describe("users collection — authenticated attacker (different account)", () => {
  it("cannot list all users", async () => {
    await expect(
      attackerPb.collection("users").getList()
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot read another user's email when emailVisibility is false", async () => {
    const record = await attackerPb.collection("users").getOne(victimUserId);
    expect(record.email).toBeFalsy();
  });
});

describe("users collection — authenticated as the record owner", () => {
  it("can read their own email", async () => {
    const ownerPb = await adminPb.collection("users").impersonate(victimUserId, 3600);
    const record = await ownerPb.collection("users").getOne(victimUserId);
    expect(record.email).toBe("security-victim@example.com");
  });
});

// ─── characters collection ────────────────────────────────────────────────────

function makeCharacterPayload() {
  const content = new Uint8Array(3);
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  const image = new File([content], "char.jpg", { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("slug", `security-test-char/outfit-${Date.now()}`);
  formData.append("name", "Security Test Char");
  formData.append("movie", "Test Movie");
  formData.append("outfit_name", "Test Outfit");
  formData.append("colors", JSON.stringify([
    { name: "Red", oklch: { l: 0.5, c: 0.2, h: 30 } },
    { name: "Blue", oklch: { l: 0.5, c: 0.1, h: 240 } },
    { name: "Gold", oklch: { l: 0.8, c: 0.15, h: 90 } },
  ]));
  formData.append("image", image);
  formData.append("image_alt", "Security Test Char — Test Outfit");
  formData.append("card_color", "#cccccc");
  formData.append("status", "approved");
  return formData;
}

describe("characters collection — anonymous attacker", () => {
  it("cannot create a character", async () => {
    await expect(
      anonPb.collection("characters").create(makeCharacterPayload())
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });
});

describe("characters collection — authenticated attacker (regular user)", () => {
  it("cannot create a character", async () => {
    await expect(
      attackerPb.collection("characters").create(makeCharacterPayload())
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot update a character", async () => {
    const existing = await adminPb.collection("characters").getFullList({ filter: "status = 'approved'" });
    if (existing.length === 0) return; // no approved characters to test against
    await expect(
      attackerPb.collection("characters").update(existing[0].id, { name: "Hacked" })
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot delete a character", async () => {
    const existing = await adminPb.collection("characters").getFullList({ filter: "status = 'approved'" });
    if (existing.length === 0) return;
    await expect(
      attackerPb.collection("characters").delete(existing[0].id)
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });
});

// ─── community_outfits collection ────────────────────────────────────────────

let securityOutfitId: string;

beforeAll(async () => {
  // Create an outfit owned by the victim to use in delete tests.
  const content = new Uint8Array(3);
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  const image = new File([content], "photo.jpg", { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("character_slug", "ariel");
  formData.append("outfit_name", "Mermaid");
  formData.append("image", image);
  formData.append("status", "approved");
  formData.append("user", victimUserId);
  const outfit = await adminPb.collection("community_outfits").create(formData);
  securityOutfitId = outfit.id;
});

afterAll(async () => {
  await adminPb.collection("community_outfits").delete(securityOutfitId).catch(() => {});
});

function makeOutfitPayload() {
  const content = new Uint8Array(3);
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  const image = new File([content], "photo.jpg", { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("character_slug", "ariel");
  formData.append("outfit_name", "Mermaid");
  formData.append("image", image);
  formData.append("status", "approved");
  formData.append("user", attackerUserId);
  return formData;
}

describe("community_outfits collection — anonymous attacker", () => {
  it("cannot create a community outfit", async () => {
    await expect(
      anonPb.collection("community_outfits").create(makeOutfitPayload())
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });
});

describe("community_outfits collection — authenticated attacker (regular user)", () => {
  it("cannot create a community outfit directly via SDK", async () => {
    await expect(
      attackerPb.collection("community_outfits").create(makeOutfitPayload())
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot delete an outfit they own directly via SDK", async () => {
    // Even ownership doesn't grant SDK delete access — must go through the API.
    const ownerPb = await adminPb.collection("users").impersonate(victimUserId, 3600);
    await expect(
      ownerPb.collection("community_outfits").delete(securityOutfitId)
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot delete another user's outfit directly via SDK", async () => {
    await expect(
      attackerPb.collection("community_outfits").delete(securityOutfitId)
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });

  it("cannot update any outfit directly via SDK", async () => {
    await expect(
      attackerPb.collection("community_outfits").update(securityOutfitId, { outfit_name: "Hacked" })
    ).rejects.toSatisfy(
      (e) => e instanceof ClientResponseError && e.status === 403
    );
  });
});
