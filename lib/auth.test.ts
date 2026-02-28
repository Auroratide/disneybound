import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import PocketBase from "pocketbase";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Import after mock is set up.
const { cookies } = await import("next/headers");
const { getServerAuth } = await import("./auth");

const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
let testUserId: string;
let rawCookieValue: string;

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const testUser = await adminPb.collection("users").create({
    email: "auth-test@example.com",
    emailVisibility: true,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
  });
  testUserId = testUser.id;

  const userPb = await adminPb.collection("users").impersonate(testUserId, 3600);
  // exportToCookie returns "pb_auth=<value>; Path=/; SameSite=Lax"
  // We only want the raw cookie value (without the key and attributes).
  const cookieString = userPb.authStore.exportToCookie().split(";")[0];
  rawCookieValue = cookieString.slice("pb_auth=".length);
});

afterAll(async () => {
  if (testUserId) {
    await adminPb.collection("users").delete(testUserId);
  }
});

describe("getServerAuth", () => {
  it("returns null user when no auth cookie is present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    const { user } = await getServerAuth();
    expect(user).toBeNull();
  });

  it("returns the user when a valid auth cookie is present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (key: string) =>
        key === "pb_auth" ? { name: "pb_auth", value: rawCookieValue } : undefined,
    } as never);

    const { user } = await getServerAuth();
    expect(user).not.toBeNull();
    expect(user!.id).toBe(testUserId);
  });
});
