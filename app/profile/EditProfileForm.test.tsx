import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { RecordModel } from "pocketbase";
import { EditProfileForm } from "./EditProfileForm";

vi.mock("@/lib/pocketbase", () => ({
  getPocketbase: vi.fn(),
}));

import { getPocketbase } from "@/lib/pocketbase";

const mockUser: RecordModel = {
  id: "user1",
  email: "test@example.com",
  name: "Disney Fan",
  avatar: "",
  collectionId: "_pb_users_auth_",
  collectionName: "users",
  created: "",
  updated: "",
};

function makePbMock(recordOverrides: Partial<RecordModel> = {}) {
  const mockSave = vi.fn();
  const mock = {
    authStore: { token: "test-token", save: mockSave, record: { ...mockUser, ...recordOverrides } },
  };
  vi.mocked(getPocketbase).mockReturnValue(mock as ReturnType<typeof getPocketbase>);
  return { mockSave };
}

function mockFetchSuccess(body: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } })
  );
}

function mockFetchFailure() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } })
  );
}

describe("EditProfileForm — view mode", () => {
  beforeEach(() => makePbMock());
  afterEach(() => vi.restoreAllMocks());

  it("shows the display name as text", () => {
    render(<EditProfileForm user={mockUser} />);
    expect(screen.getByText("Disney Fan")).toBeDefined();
  });

  it("does not show an input for the display name by default", () => {
    render(<EditProfileForm user={mockUser} />);
    expect(screen.queryByRole("textbox", { name: /display name/i })).toBeNull();
  });

  it("shows the email as text", () => {
    render(<EditProfileForm user={mockUser} />);
    expect(screen.getByText("test@example.com")).toBeDefined();
  });

  it("shows 'Not set' when display name is empty", () => {
    makePbMock({ name: "" });
    render(<EditProfileForm user={{ ...mockUser, name: "" }} />);
    expect(screen.getByText(/not set/i)).toBeDefined();
  });

  it("renders a profile picture upload button", () => {
    render(<EditProfileForm user={mockUser} />);
    expect(screen.getByLabelText(/upload profile picture/i)).toBeDefined();
  });
});

describe("EditProfileForm — editing name", () => {
  beforeEach(() => makePbMock());
  afterEach(() => vi.restoreAllMocks());

  it("shows input when the edit button is clicked", () => {
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    expect(screen.getByRole("textbox", { name: /display name/i })).toBeDefined();
  });

  it("pre-fills the input with the current name", () => {
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    const input = screen.getByRole("textbox", { name: /display name/i }) as HTMLInputElement;
    expect(input.value).toBe("Disney Fan");
  });

  it("reverts to view mode and discards changes when cancel is clicked", () => {
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /display name/i }), {
      target: { value: "Something Else" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cancel editing/i }));

    expect(screen.queryByRole("textbox", { name: /display name/i })).toBeNull();
    expect(screen.getByText("Disney Fan")).toBeDefined();
  });

  it("saves the name and returns to view mode on submit", async () => {
    const { mockSave } = makePbMock();
    const mockFetch = mockFetchSuccess({ name: "New Name", avatarUrl: null });

    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /display name/i }), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());
    expect(mockFetch).toHaveBeenCalledWith("/api/users/me", expect.objectContaining({ method: "PATCH" }));
    expect(mockSave).toHaveBeenCalledWith("test-token", expect.any(Object));
    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: /display name/i })).toBeNull();
    });
  });

  it("shows a success message after saving", async () => {
    mockFetchSuccess({ name: "Disney Fan", avatarUrl: null });

    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name updated/i)).toBeDefined();
    });
  });

  it("shows an error and stays in edit mode when save fails", async () => {
    mockFetchFailure();

    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update name/i)).toBeDefined();
    });
    expect(screen.getByRole("textbox", { name: /display name/i })).toBeDefined();
  });

  it("disables the save button while saving", async () => {
    let resolveFetch!: (val: Response) => void;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>(res => { resolveFetch = res; })
    );

    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saving/i }).hasAttribute("disabled")).toBe(true);
    });

    resolveFetch(new Response(JSON.stringify({ name: "Disney Fan", avatarUrl: null }), { status: 200 }));
  });
});

describe("EditProfileForm — avatar upload", () => {
  beforeEach(() => makePbMock());
  afterEach(() => vi.restoreAllMocks());

  it("auto-saves the avatar immediately when a file is picked", async () => {
    const mockFetch = mockFetchSuccess({ name: "Disney Fan", avatarUrl: "https://example.com/avatar.jpg" });

    render(<EditProfileForm user={mockUser} />);

    const file = new File(["img"], "avatar.png", { type: "image/png" });
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());
    expect(mockFetch).toHaveBeenCalledWith("/api/users/me", expect.objectContaining({ method: "PATCH" }));
  });

  it("shows an error if the avatar upload fails", async () => {
    mockFetchFailure();

    render(<EditProfileForm user={mockUser} />);

    const file = new File(["img"], "avatar.png", { type: "image/png" });
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/failed to upload photo/i)).toBeDefined();
    });
  });
});
