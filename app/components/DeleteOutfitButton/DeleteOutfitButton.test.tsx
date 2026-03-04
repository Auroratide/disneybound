import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { DeleteOutfitButton } from "./DeleteOutfitButton";

beforeEach(() => {
  vi.clearAllMocks();
  window.fetch = vi.fn();
});

describe("DeleteOutfitButton", () => {
  it("calls DELETE /api/community-outfits/[id] when clicked", async () => {
    (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 204 });

    render(<DeleteOutfitButton id="abc123" />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith("/api/community-outfits/abc123", { method: "DELETE" });
    });
  });

  it("calls router.refresh() on success", async () => {
    (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 204 });
    const mockRefresh = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ refresh: mockRefresh });

    render(<DeleteOutfitButton id="abc123" />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows an error when deletion fails", async () => {
    (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ status: 403 });

    render(<DeleteOutfitButton id="abc123" />);
    fireEvent.click(screen.getByRole("button", { name: /delete outfit/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not delete/i)).toBeDefined();
    });
  });
});
