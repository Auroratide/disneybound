import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { DeleteOutfitButton } from "./DeleteOutfitButton";

const DEFAULT_PROPS = { id: "abc123", imageUrl: "https://example.com/outfit.jpg" };

beforeEach(() => {
  vi.clearAllMocks();
  window.fetch = vi.fn();
});

describe("DeleteOutfitButton", () => {
  it("opens a confirmation dialog when clicked", async () => {
    render(<DeleteOutfitButton {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /remove this outfit/i })).toBeDefined();
    });
  });

  it("shows the outfit image in the dialog", async () => {
    render(<DeleteOutfitButton {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));
    await waitFor(() => {
      expect(screen.getByAltText(/outfit to remove/i)).toBeDefined();
    });
  });

  it("closes the dialog when cancel is clicked", async () => {
    render(<DeleteOutfitButton {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));
    await waitFor(() => screen.getByRole("heading", { name: /remove this outfit/i }));

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /remove this outfit/i })).toBeNull();
    });
  });

  it("calls DELETE /api/community-outfits/[id] when Remove is clicked", async () => {
    (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 204 });

    render(<DeleteOutfitButton {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));
    await waitFor(() => screen.getByRole("button", { name: /remove/i }));

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith("/api/community-outfits/abc123", { method: "DELETE" });
    });
  });

  it("calls router.refresh() and closes the dialog on success", async () => {
    (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 204 });
    const mockRefresh = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ refresh: mockRefresh });

    render(<DeleteOutfitButton {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));
    await waitFor(() => screen.getByRole("button", { name: /remove/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /remove this outfit/i })).toBeNull();
    });
  });

  it("shows an error and a try again button when deletion fails", async () => {
    (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 403 });

    render(<DeleteOutfitButton {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));
    await waitFor(() => screen.getByRole("button", { name: /remove/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /try again/i })).toBeDefined();
    });
  });
});
