import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { POST } from "./route";

// Admin client used only for post-test cleanup (deleteRule is admin-only).
const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const createdIds: string[] = [];

beforeAll(async () => {
  await adminPb.collection("_superusers").authWithPassword(
    process.env.PB_SUPERUSER_EMAIL!,
    process.env.PB_SUPERUSER_PASSWORD!
  );
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

function makeRequest(fields: Record<string, string | File>): NextRequest {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return new NextRequest("http://localhost/api/community-outfits", {
    method: "POST",
    body: formData,
  });
}

function makeImage(name = "photo.jpg", type = "image/jpeg", sizeBytes = 16): File {
  // PocketBase sniffs file content to verify the MIME type (Go's DetectContentType).
  // JPEG files must start with FF D8 FF, otherwise PocketBase rejects the upload.
  const content = new Uint8Array(Math.max(sizeBytes, 3));
  content[0] = 0xFF; content[1] = 0xD8; content[2] = 0xFF;
  return new File([content], name, { type });
}

describe("POST /api/community-outfits", () => {
  it("returns 400 when character_slug is missing", async () => {
    const res = await POST(makeRequest({ outfit_name: "Mermaid", image: makeImage() }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when outfit_name is missing", async () => {
    const res = await POST(makeRequest({ character_slug: "ariel", image: makeImage() }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when image is missing", async () => {
    const res = await POST(makeRequest({ character_slug: "ariel", outfit_name: "Mermaid" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a disallowed image type", async () => {
    const res = await POST(makeRequest({
      character_slug: "ariel",
      outfit_name: "Mermaid",
      image: makeImage("doc.pdf", "application/pdf"),
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when image exceeds 5 MB", async () => {
    const res = await POST(makeRequest({
      character_slug: "ariel",
      outfit_name: "Mermaid",
      image: makeImage("big.jpg", "image/jpeg", 5 * 1024 * 1024 + 1),
    }));
    expect(res.status).toBe(400);
  });

  it("creates a pending record and returns 201 with id", async () => {
    const res = await POST(makeRequest({
      character_slug: "ariel",
      outfit_name: "Mermaid",
      image: makeImage(),
      submitter_name: "TestUser",
    }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(typeof body.id).toBe("string");

    createdIds.push(body.id);

    const record = await adminPb.collection("community_outfits").getOne(body.id);
    expect(record.character_slug).toBe("ariel");
    expect(record.outfit_name).toBe("Mermaid");
    expect(record.submitter_name).toBe("TestUser");
    expect(record.status).toBe("pending");
  });

  it("omits submitter_name when not provided", async () => {
    const res = await POST(makeRequest({
      character_slug: "ariel",
      outfit_name: "Mermaid",
      image: makeImage(),
    }));
    const body = await res.json();
    expect(res.status).toBe(201);

    createdIds.push(body.id);

    const record = await adminPb.collection("community_outfits").getOne(body.id);
    expect(record.submitter_name).toBe("");
  });
});
