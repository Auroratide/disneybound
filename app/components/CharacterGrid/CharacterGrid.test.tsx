import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CharacterGrid } from "./CharacterGrid";

afterEach(cleanup);

const characters = [
  {
    slug: "ariel",
    name: "Ariel",
    movie: "The Little Mermaid",
    outfits: [
      {
        name: "Classic",
        imageSrc: "/ariel.jpg",
        imageAlt: "Ariel",
        cardColor: "#5bc0de",
        colors: [],
      },
    ],
  },
  {
    slug: "rapunzel",
    name: "Rapunzel",
    movie: "Tangled",
    outfits: [
      {
        name: "Classic",
        imageSrc: "/rapunzel.jpg",
        imageAlt: "Rapunzel",
        cardColor: "#f0e68c",
        colors: [],
      },
    ],
  },
];

describe("CharacterGrid", () => {
  it("shows all characters on initial render", () => {
    render(<CharacterGrid characters={characters} />);
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });

  it("filters by character name", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByPlaceholderText("Search by name or movie…"), {
      target: { value: "ariel" },
    });
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.queryByText("Rapunzel")).toBeNull();
  });

  it("filters by movie name", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByPlaceholderText("Search by name or movie…"), {
      target: { value: "tangled" },
    });
    expect(screen.queryByText("Ariel")).toBeNull();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });

  it("is case-insensitive", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByPlaceholderText("Search by name or movie…"), {
      target: { value: "ARIEL" },
    });
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.queryByText("Rapunzel")).toBeNull();
  });

  it("shows empty state when no characters match", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByPlaceholderText("Search by name or movie…"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("No characters match your search.")).toBeDefined();
  });

  it("restores all characters when the query is cleared", () => {
    render(<CharacterGrid characters={characters} />);
    const input = screen.getByPlaceholderText("Search by name or movie…");
    fireEvent.change(input, { target: { value: "ariel" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });
});
