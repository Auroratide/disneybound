import { describe, it, expect, beforeAll, afterEach } from "vitest";
import PocketBase from "pocketbase";
import { getCommunityOutfits } from "./community-outfits";

// Admin client — needed to create records with arbitrary status and to delete after each test.
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
  submitter_name?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("character_slug", fields.character_slug);
  formData.append("outfit_name", fields.outfit_name);
  formData.append("image", makeImage());
  formData.append("status", fields.status);
  if (fields.submitter_name) {
    formData.append("submitter_name", fields.submitter_name);
  }
  const record = await adminPb.collection("community_outfits").create(formData);
  createdIds.push(record.id);
  return record.id;
}

describe("getCommunityOutfits", () => {
  it("returns an empty array when no approved records exist", async () => {
    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results).toEqual([]);
  });

  it("returns only approved records, not pending or rejected", async () => {
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "pending" });
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "rejected" });
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "approved" });

    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results).toHaveLength(1);
  });

  it("filters by character_slug", async () => {
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "approved" });
    await createRecord({ character_slug: "rapunzel", outfit_name: "Mermaid", status: "approved" });

    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results).toHaveLength(1);
    expect(results[0].characterSlug).toBe("ariel");
  });

  it("filters by outfit_name", async () => {
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "approved" });
    await createRecord({ character_slug: "ariel", outfit_name: "Princess Dress", status: "approved" });

    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results).toHaveLength(1);
    expect(results[0].outfitName).toBe("Mermaid");
  });

  it("maps snake_case record fields to camelCase", async () => {
    await createRecord({
      character_slug: "ariel",
      outfit_name: "Mermaid",
      status: "approved",
      submitter_name: "DisneyStar",
    });

    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results[0].characterSlug).toBe("ariel");
    expect(results[0].outfitName).toBe("Mermaid");
    expect(results[0].submitterName).toBe("DisneyStar");
  });

  it("sets submitterName to null when submitter_name is empty", async () => {
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "approved" });

    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results[0].submitterName).toBeNull();
  });

  it("returns a valid PocketBase file URL for imageUrl", async () => {
    await createRecord({ character_slug: "ariel", outfit_name: "Mermaid", status: "approved" });

    const results = await getCommunityOutfits("ariel", "Mermaid");
    expect(results[0].imageUrl).toMatch(/^http.*\/api\/files\//);
  });
});
