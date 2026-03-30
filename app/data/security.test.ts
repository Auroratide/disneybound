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
