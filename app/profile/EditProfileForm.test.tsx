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

function makePbMock(overrides: Record<string, unknown> = {}) {
  const mockUpdate = vi.fn().mockResolvedValue({ ...mockUser, name: "Updated Name" });
  const mockSave = vi.fn();
  const mock = {
    collection: () => ({ update: mockUpdate }),
    authStore: { token: "test-token", save: mockSave, record: null },
    files: { getURL: vi.fn().mockReturnValue("https://example.com/avatar.jpg") },
    ...overrides,
  };
  vi.mocked(getPocketbase).mockReturnValue(mock as ReturnType<typeof getPocketbase>);
  return { mockUpdate, mockSave, mock };
}

describe("EditProfileForm — view mode", () => {
  beforeEach(() => makePbMock());
  afterEach(() => vi.clearAllMocks());

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
  afterEach(() => vi.clearAllMocks());

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
    const { mockUpdate, mockSave } = makePbMock();
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /display name/i }), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledOnce());
    expect(mockUpdate).toHaveBeenCalledWith("user1", expect.any(FormData));
    expect(mockSave).toHaveBeenCalledWith("test-token", expect.any(Object));
    expect(screen.queryByRole("textbox", { name: /display name/i })).toBeNull();
  });

  it("shows a success message after saving", async () => {
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name updated/i)).toBeDefined();
    });
  });

  it("shows an error and stays in edit mode when save fails", async () => {
    const { mockUpdate } = makePbMock();
    mockUpdate.mockRejectedValue(new Error("Server error"));
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update name/i)).toBeDefined();
    });
    expect(screen.getByRole("textbox", { name: /display name/i })).toBeDefined();
  });

  it("disables the save button while saving", async () => {
    let resolveUpdate!: (val: RecordModel) => void;
    const { mockUpdate } = makePbMock();
    mockUpdate.mockImplementation(
      () => new Promise<RecordModel>(res => { resolveUpdate = res; })
    );

    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /edit display name/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saving/i }).hasAttribute("disabled")).toBe(true);
    });

    resolveUpdate({ ...mockUser });
  });
});

describe("EditProfileForm — avatar upload", () => {
  afterEach(() => vi.clearAllMocks());

  it("auto-saves the avatar immediately when a file is picked", async () => {
    const { mockUpdate } = makePbMock();
    render(<EditProfileForm user={mockUser} />);

    const file = new File(["img"], "avatar.png", { type: "image/png" });
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledOnce());
    expect(mockUpdate).toHaveBeenCalledWith("user1", expect.any(FormData));
  });

  it("shows an error if the avatar upload fails", async () => {
    const { mockUpdate } = makePbMock();
    mockUpdate.mockRejectedValue(new Error("Upload failed"));
    render(<EditProfileForm user={mockUser} />);

    const file = new File(["img"], "avatar.png", { type: "image/png" });
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/failed to upload photo/i)).toBeDefined();
    });
  });
});
