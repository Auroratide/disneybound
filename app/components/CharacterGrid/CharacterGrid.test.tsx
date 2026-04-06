import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterGrid } from "./CharacterGrid";

const characters = [
  {
    slug: "ariel",
    name: "Ariel",
    movie: "The Little Mermaid",
    imageSrc: "/ariel.jpg",
    imageAlt: "Ariel",
    cardColor: "#5bc0de",
    colors: [],
  },
  {
    slug: "rapunzel",
    name: "Rapunzel",
    movie: "Tangled",
    imageSrc: "/rapunzel.jpg",
    imageAlt: "Rapunzel",
    cardColor: "#f0e68c",
    colors: [],
  },
];

describe("CharacterGrid", () => {
  it("renders all provided characters", () => {
    render(<CharacterGrid characters={characters} />);
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });

  it("renders nothing when characters list is empty", () => {
    const { container } = render(<CharacterGrid characters={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("links each character to their detail page", () => {
    render(<CharacterGrid characters={characters} />);
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/characters/ariel")).toBe(true);
    expect(links.some((l) => l.getAttribute("href") === "/characters/rapunzel")).toBe(true);
  });
});
