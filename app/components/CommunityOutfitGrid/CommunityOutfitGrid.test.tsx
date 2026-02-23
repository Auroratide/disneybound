import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommunityOutfitGrid } from "./CommunityOutfitGrid";
import type { CommunityOutfit } from "@/app/data/community-outfits";

const outfit = (overrides: Partial<CommunityOutfit> = {}): CommunityOutfit => ({
  id: "1",
  characterSlug: "ariel",
  outfitName: "Mermaid",
  imageUrl: "http://127.0.0.1:8090/api/files/abc/1/photo.jpg",
  submitterName: null,
  ...overrides,
});

describe("CommunityOutfitGrid", () => {
  it("renders nothing when there are no outfits", () => {
    const { container } = render(<CommunityOutfitGrid outfits={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an image for each outfit", () => {
    render(
      <CommunityOutfitGrid
        outfits={[
          outfit({ id: "1" }),
          outfit({ id: "2" }),
          outfit({ id: "3" }),
        ]}
      />
    );
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("shows the submitter name when provided", () => {
    render(<CommunityOutfitGrid outfits={[outfit({ submitterName: "MickeyFan" })]} />);
    expect(screen.getByText("MickeyFan")).toBeDefined();
  });

  it("does not show a submitter name when it is null", () => {
    render(<CommunityOutfitGrid outfits={[outfit({ submitterName: null })]} />);
    expect(screen.queryByText("MickeyFan")).toBeNull();
  });

  it("uses the submitter name in the image alt text when provided", () => {
    render(<CommunityOutfitGrid outfits={[outfit({ submitterName: "DisneyStar" })]} />);
    expect(screen.getByAltText("Outfit by DisneyStar")).toBeDefined();
  });

  it("uses a generic alt text when submitter name is null", () => {
    render(<CommunityOutfitGrid outfits={[outfit({ submitterName: null })]} />);
    expect(screen.getByAltText("Community outfit")).toBeDefined();
  });
});
