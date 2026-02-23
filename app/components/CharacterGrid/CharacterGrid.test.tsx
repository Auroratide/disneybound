import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterGrid } from "./CharacterGrid";

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
  it("announces result count to screen readers on initial render", () => {
    render(<CharacterGrid characters={characters} />);
    expect(screen.getByRole("status").textContent).toBe("2 characters found.");
  });

  it("announces updated result count after filtering", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByLabelText(/search by name or movie/i), {
      target: { value: "ariel" },
    });
    expect(screen.getByRole("status").textContent).toBe("1 character found.");
  });

  it("announces no results to screen readers", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByLabelText(/search by name or movie/i), {
      target: { value: "zzz" },
    });
    expect(screen.getByRole("status").textContent).toBe("No characters match your search.");
  });

  it("shows all characters on initial render", () => {
    render(<CharacterGrid characters={characters} />);
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });

  it("filters by character name", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByLabelText(/search by name or movie/i), {
      target: { value: "ariel" },
    });
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.queryByText("Rapunzel")).toBeNull();
  });

  it("filters by movie name", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByLabelText(/search by name or movie/i), {
      target: { value: "tangled" },
    });
    expect(screen.queryByText("Ariel")).toBeNull();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });

  it("is case-insensitive", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByLabelText(/search by name or movie/i), {
      target: { value: "ARIEL" },
    });
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.queryByText("Rapunzel")).toBeNull();
  });

  it("shows empty state when no characters match", () => {
    render(<CharacterGrid characters={characters} />);
    fireEvent.change(screen.getByLabelText(/search by name or movie/i), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("No characters match your search.")).toBeDefined();
  });

  it("restores all characters when the query is cleared", () => {
    render(<CharacterGrid characters={characters} />);
    const input = screen.getByLabelText(/search by name or movie/i);
    fireEvent.change(input, { target: { value: "ariel" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Ariel")).toBeDefined();
    expect(screen.getByText("Rapunzel")).toBeDefined();
  });
});
