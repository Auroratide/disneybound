import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { POST } from "./route";

const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const createdIds: string[] = [];
let testUserId: string;
let userCookie: string;

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );

  const testUser = await adminPb.collection("users").create({
    email: "suggest-test@example.com",
    emailVisibility: true,
    password: "test-password-unused",
    passwordConfirm: "test-password-unused",
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

afterEach(async () => {
  for (const id of createdIds) {
    await adminPb.collection("characters").delete(id).catch(() => {});
  }
  createdIds.length = 0;
});

// Minimal valid JPEG (PocketBase sniffs content for MIME type validation).
function makeImage(name = "char.jpg", type = "image/jpeg", sizeBytes = 16): File {
  const content = new Uint8Array(Math.max(sizeBytes, 3));
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  return new File([content], name, { type });
}

const VALID_COLORS = JSON.stringify([
  { name: "Blue", oklch: { l: 0.5, c: 0.1, h: 240 }, usage: "Dress — a blue top or skirt" },
  { name: "Gold", oklch: { l: 0.8, c: 0.15, h: 90 }, usage: "Jewelry — gold accessories" },
  { name: "Red", oklch: { l: 0.5, c: 0.2, h: 30 }, usage: "Accents — a red belt or bag" },
]);

function makeRequest(
  fields: Record<string, string | File>,
  options: { cookie?: string } = {}
): NextRequest {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  const headers: Record<string, string> = {};
  if (options.cookie) headers["Cookie"] = options.cookie;
  return new NextRequest("http://localhost/api/characters", {
    method: "POST",
    body: formData,
    headers,
  });
}

function validFields(overrides: Record<string, string | File> = {}): Record<string, string | File> {
  return {
    name: "Test Character",
    movie: "Test Movie",
    outfit_name: "Test Outfit",
    colors: VALID_COLORS,
    image: makeImage(),
    ...overrides,
  };
}

describe("POST /api/characters", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await POST(makeRequest(validFields()));
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    const fields = validFields();
    delete (fields as Record<string, unknown>).name;
    const res = await POST(makeRequest(fields, { cookie: userCookie }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when movie is missing", async () => {
    const fields = validFields();
    delete (fields as Record<string, unknown>).movie;
    const res = await POST(makeRequest(fields, { cookie: userCookie }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when outfit_name is missing", async () => {
    const fields = validFields();
    delete (fields as Record<string, unknown>).outfit_name;
    const res = await POST(makeRequest(fields, { cookie: userCookie }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when colors is missing", async () => {
    const fields = validFields();
    delete (fields as Record<string, unknown>).colors;
    const res = await POST(makeRequest(fields, { cookie: userCookie }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when colors is not an array of 3", async () => {
    const res = await POST(makeRequest(
      validFields({ colors: JSON.stringify([{ name: "Blue", oklch: { l: 0.5, c: 0.1, h: 240 }, usage: "Dress" }]) }),
      { cookie: userCookie }
    ));
    expect(res.status).toBe(400);
  });

  it("returns 400 when image is missing", async () => {
    const fields = validFields();
    delete (fields as Record<string, unknown>).image;
    const res = await POST(makeRequest(fields, { cookie: userCookie }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a disallowed image type", async () => {
    const res = await POST(makeRequest(
      validFields({ image: makeImage("doc.pdf", "application/pdf") }),
      { cookie: userCookie }
    ));
    expect(res.status).toBe(400);
  });

  it("returns 400 when image exceeds 5 MB", async () => {
    const res = await POST(makeRequest(
      validFields({ image: makeImage("big.jpg", "image/jpeg", 5 * 1024 * 1024 + 1) }),
      { cookie: userCookie }
    ));
    expect(res.status).toBe(400);
  });

  it("creates a pending record and returns 201 with id and slug", async () => {
    const res = await POST(makeRequest(validFields(), { cookie: userCookie }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(typeof body.id).toBe("string");
    expect(body.slug).toBe("test-character/test-outfit");

    createdIds.push(body.id);

    const record = await adminPb.collection("characters").getOne(body.id);
    expect(record.slug).toBe("test-character/test-outfit");
    expect(record.name).toBe("Test Character");
    expect(record.movie).toBe("Test Movie");
    expect(record.outfit_name).toBe("Test Outfit");
    expect(record.status).toBe("pending");
    expect(record.submitted_by).toBe(testUserId);
  });

  it("returns 409 when a character with the same slug already exists", async () => {
    // Create an approved character with the same slug via admin.
    const image = makeImage();
    const setupForm = new FormData();
    setupForm.append("slug", "test-character/test-outfit");
    setupForm.append("name", "Test Character");
    setupForm.append("movie", "Test Movie");
    setupForm.append("outfit_name", "Test Outfit");
    setupForm.append("colors", VALID_COLORS);
    setupForm.append("image", image);
    setupForm.append("image_alt", "Test Character — Test Outfit");
    setupForm.append("card_color", "#cccccc");
    setupForm.append("status", "approved");
    const existing = await adminPb.collection("characters").create(setupForm);
    createdIds.push(existing.id);

    const res = await POST(makeRequest(validFields(), { cookie: userCookie }));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.slug).toBe("test-character/test-outfit");
  });
});
