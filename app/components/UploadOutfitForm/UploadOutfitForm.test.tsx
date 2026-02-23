import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadOutfitForm } from "./UploadOutfitForm";

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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a file input for the outfit photo", () => {
    render(<UploadOutfitForm {...defaultProps} />);
    expect(screen.getByLabelText(/photo/i)).toBeDefined();
  });

  it("renders an optional name or handle input", () => {
    render(<UploadOutfitForm {...defaultProps} />);
    expect(screen.getByLabelText(/name or handle/i)).toBeDefined();
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

  it("sends the image, character_slug, outfit_name, and submitter_name to the API", async () => {
    render(<UploadOutfitForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.change(screen.getByLabelText(/name or handle/i), {
      target: { value: "DisneyFan" },
    });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/community-outfits");
    expect(options.method).toBe("POST");

    const body = options.body as FormData;
    expect(body.get("character_slug")).toBe("ariel");
    expect(body.get("outfit_name")).toBe("Mermaid");
    expect(body.get("submitter_name")).toBe("DisneyFan");
    expect(body.get("image")).toBeInstanceOf(File);
  });

  it("omits submitter_name from the request when the name field is empty", async () => {
    render(<UploadOutfitForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/photo/i), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());

    const body = mockFetch.mock.calls[0][1].body as FormData;
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
});
