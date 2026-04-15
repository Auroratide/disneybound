import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { RecordModel } from "pocketbase";
import { CommunityOutfitsSection } from "./CommunityOutfitsSection";
import type { CommunityOutfit } from "@/app/data/community-outfits";

vi.mock("@/app/components/AuthProvider/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/app/components/AuthProvider/AuthProvider";

const mockUser = { id: "user1", email: "test@example.com" } as RecordModel;

const outfit = (overrides: Partial<CommunityOutfit> = {}): CommunityOutfit => ({
  id: "1",
  characterSlug: "ariel",
  outfitName: "Mermaid",
  imageUrl: "http://127.0.0.1:8090/api/files/abc/1/photo.jpg",
  userName: "DisneyFan",
  avatarUrl: null,
  userId: "user1",
  ...overrides,
});

const defaultProps = {
  outfits: [outfit()],
  currentUserId: null,
  characterSlug: "ariel",
  outfitName: "Mermaid",
};

function makeImageFile(name = "photo.jpg", type = "image/jpeg"): File {
  const content = new Uint8Array(16);
  content[0] = 0xff; content[1] = 0xd8; content[2] = 0xff;
  return new File([content], name, { type });
}

describe("CommunityOutfitsSection — outfit grid", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,

      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => vi.clearAllMocks());

  it("renders an image for each outfit", () => {
    render(
      <CommunityOutfitsSection
        {...defaultProps}
        outfits={[outfit({ id: "1" }), outfit({ id: "2" }), outfit({ id: "3" })]}
      />
    );
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(3);
  });

  it("renders nothing when there are no outfits and user is logged in (grid hidden)", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows a delete button for outfits owned by the current user", () => {
    render(
      <CommunityOutfitsSection
        {...defaultProps}
        outfits={[outfit({ id: "1", userId: "user1" })]}
        currentUserId="user1"
      />
    );
    expect(screen.getByRole("button", { name: /delete outfit/i })).toBeDefined();
  });

  it("does not show a delete button for outfits owned by a different user", () => {
    render(
      <CommunityOutfitsSection
        {...defaultProps}
        outfits={[outfit({ id: "1", userId: "user2" })]}
        currentUserId="user1"
      />
    );
    expect(screen.queryByRole("button", { name: /delete outfit/i })).toBeNull();
  });

  it("does not show a delete button when currentUserId is null", () => {
    render(
      <CommunityOutfitsSection
        {...defaultProps}
        outfits={[outfit({ id: "1", userId: "user1" })]}
        currentUserId={null}
      />
    );
    expect(screen.queryByRole("button", { name: /delete outfit/i })).toBeNull();
  });
});

describe("CommunityOutfitsSection — expand/collapse toggle", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,

      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => vi.clearAllMocks());

  it("starts collapsed when outfits exist", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    expect(screen.getByRole("button", { name: /share yours/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /share outfit/i })).toBeNull();
  });

  it("starts expanded when there are no outfits", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.getByRole("button", { name: /share outfit/i })).toBeDefined();
  });

  it("shows the form when toggle button is clicked", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    fireEvent.click(screen.getByRole("button", { name: /share yours/i }));
    expect(screen.getByRole("button", { name: /share outfit/i })).toBeDefined();
  });

  it("hides the form when toggle button is clicked again", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    const toggle = screen.getByRole("button", { name: /share yours/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(screen.queryByRole("button", { name: /share outfit/i })).toBeNull();
  });

  it("toggle button reflects aria-expanded state", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    const toggle = screen.getByRole("button", { name: /share yours/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /hide/i }).getAttribute("aria-expanded")).toBe("true");
  });

  it("toggle button aria-controls matches the form region id", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    const toggle = screen.getByRole("button", { name: /share yours/i });
    const controlsId = toggle.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    fireEvent.click(toggle);
    expect(document.getElementById(controlsId!)).toBeDefined();
  });

  it("cancel button collapses the form", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    fireEvent.click(screen.getByRole("button", { name: /share yours/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("button", { name: /share outfit/i })).toBeNull();
  });
});

describe("CommunityOutfitsSection — unauthenticated", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,

      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => vi.clearAllMocks());

  it("shows a login prompt when expanded and user is not logged in", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.getByText(/log in to share/i)).toBeDefined();
  });

  it("shows a Log in button", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeDefined();
  });

  it("does not show the upload form when not logged in", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.queryByRole("button", { name: /share outfit/i })).toBeNull();
  });
});

describe("CommunityOutfitsSection — instructions prop", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows instructions when logged in and expanded", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,

      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <CommunityOutfitsSection
        {...defaultProps}
        outfits={[]}
        instructions={<span>Be the first to share!</span>}
      />
    );
    expect(screen.getByText("Be the first to share!")).toBeDefined();
  });

  it("does not show instructions when not logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,

      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <CommunityOutfitsSection
        {...defaultProps}
        outfits={[]}
        instructions={<span>Be the first to share!</span>}
      />
    );
    expect(screen.queryByText("Be the first to share!")).toBeNull();
  });
});

describe("CommunityOutfitsSection — upload form", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "abc123" }), { status: 201 })
    );
    vi.stubGlobal("fetch", mockFetch);
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,

      confirmOtp: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows a file input for the outfit photo", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.getByLabelText("Outfit photo")).toBeDefined();
  });

  it("shows a submit button", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    expect(screen.getByRole("button", { name: /share outfit/i })).toBeDefined();
  });

  it("shows a validation error when submitting without selecting a photo", async () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /share outfit/i }));
    await waitFor(() => {
      expect(screen.getByText(/please select a photo/i)).toBeDefined();
    });
  });

  it("sends a POST to /api/community-outfits with correct fields", async () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share outfit/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/community-outfits");
    expect(options.method).toBe("POST");

    const body = options.body as FormData;
    expect(body.get("character_slug")).toBe("ariel");
    expect(body.get("outfit_name")).toBe("Mermaid");
    expect(body.get("image")).toBeInstanceOf(File);
  });

  it("shows success message after a successful upload", async () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share outfit/i }));

    await waitFor(() => {
      expect(screen.getByText(/thanks! your outfit has been shared/i)).toBeDefined();
    });
  });

  it("hides the toggle button after a successful upload", async () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share outfit/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /share yours/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /hide/i })).toBeNull();
    });
  });

  it("shows an error message when the upload fails", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );

    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share outfit/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeDefined();
    });
  });

  it("stays on the form after an error", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );

    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });
    fireEvent.click(screen.getByRole("button", { name: /share outfit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /share outfit/i })).toBeDefined();
    });
  });

  it("disables the submit button while uploading", async () => {
    let resolveUpload!: (res: Response) => void;
    mockFetch.mockImplementation(
      () => new Promise<Response>(res => { resolveUpload = res; })
    );

    render(<CommunityOutfitsSection {...defaultProps} outfits={[]} />);

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });

    const button = screen.getByRole("button", { name: /share/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button.hasAttribute("disabled")).toBe(true);
    });

    resolveUpload(new Response(JSON.stringify({ id: "1" }), { status: 201 }));
  });

  it("resets state when cancel is clicked", () => {
    render(<CommunityOutfitsSection {...defaultProps} outfits={[outfit()]} />);
    fireEvent.click(screen.getByRole("button", { name: /share yours/i }));

    fireEvent.change(screen.getByLabelText("Outfit photo"), {
      target: { files: [makeImageFile()] },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Re-expand to verify state was reset
    fireEvent.click(screen.getByRole("button", { name: /share yours/i }));
    expect(screen.queryByRole("img", { name: /preview/i })).toBeNull();
  });
});
