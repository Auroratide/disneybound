import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { RecordModel } from "pocketbase";
import { UploadOutfitForm } from "./UploadOutfitForm";

vi.mock("@/app/components/AuthProvider/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/app/components/AuthProvider/AuthProvider";

const mockUser = { id: "user1", email: "test@example.com" } as RecordModel;

const defaultProps = {
  characterSlug: "ariel",
  outfitName: "Mermaid",
};

function makeImageFile(name = "photo.jpg", type = "image/jpeg"): File {
  // Start with JPEG magic bytes so content sniffers recognise the format.
  const content = new Uint8Array(16);
  content[0] = 0xff; content[1] = 0xd8; content[2] = 0xff;
  return new File([content], name, { type });
}

describe("UploadOutfitForm", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "abc123" }), { status: 201 })
    );
    vi.stubGlobal("fetch", mockFetch);
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      requestOtp: vi.fn(),
      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a file input for the outfit photo", () => {
    render(<UploadOutfitForm {...defaultProps} />);
    expect(screen.getByLabelText(/photo/i)).toBeDefined();
  });

  it("renders a submit button", () => {
    render(<UploadOutfitForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /share/i })).toBeDefined();
  });

  it("does not show a success message initially", () => {
    render(<UploadOutfitForm {...defaultProps} />);
    expect(screen.queryByText(/thanks/i)).toBeNull();
  });

  it("shows an image preview after selecting a photo", async () => {
    render(<UploadOutfitForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });
    await waitFor(() => {
      expect(screen.getByRole("img")).toBeDefined();
    });
  });

  it("shows a validation message when submitting without a photo", async () => {
    render(<UploadOutfitForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    await waitFor(() => {
      expect(screen.getByText(/photo is required/i)).toBeDefined();
    });
  });

  it("sends the image, character_slug, and outfit_name to the API", async () => {
    render(<UploadOutfitForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/community-outfits");
    expect(options.method).toBe("POST");

    const body = options.body as FormData;
    expect(body.get("character_slug")).toBe("ariel");
    expect(body.get("outfit_name")).toBe("Mermaid");
    expect(body.get("image")).toBeInstanceOf(File);
    expect(body.get("submitter_name")).toBeNull();
  });

  it("shows the success message after a successful upload", async () => {
    render(<UploadOutfitForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByText(/thanks! your outfit will appear after review/i)).toBeDefined();
    });
  });

  it("shows an error message when the upload fails", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );

    render(<UploadOutfitForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeDefined();
    });
  });

  it("disables the submit button while the upload is in progress", async () => {
    let resolveUpload!: (res: Response) => void;
    mockFetch.mockImplementation(
      () => new Promise<Response>(res => { resolveUpload = res; })
    );

    render(<UploadOutfitForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });

    const button = screen.getByRole("button", { name: /share/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button.hasAttribute("disabled")).toBe(true);
    });

    // Resolve so the pending promise doesn't keep the test alive.
    resolveUpload(new Response(JSON.stringify({ id: "1" }), { status: 201 }));
  });

  describe("when unauthenticated", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        requestOtp: vi.fn(),
        confirmOtp: vi.fn(),
        logout: vi.fn(),
      });
    });

    it("shows a log in prompt instead of the upload form", () => {
      render(<UploadOutfitForm {...defaultProps} />);
      expect(screen.getByText(/log in to share your outfit/i)).toBeDefined();
      expect(screen.queryByRole("button", { name: /share/i })).toBeNull();
    });

    it("has a log in button", () => {
      render(<UploadOutfitForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: /log in/i })).toBeDefined();
    });
  });
});
