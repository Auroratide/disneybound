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

describe("EditProfileForm", () => {
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUpdate = vi.fn().mockResolvedValue({ ...mockUser, name: "Updated Name" });
    mockSave = vi.fn();
    vi.mocked(getPocketbase).mockReturnValue({
      collection: () => ({ update: mockUpdate }),
      authStore: { token: "test-token", save: mockSave },
    } as ReturnType<typeof getPocketbase>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("pre-fills the display name with the user's current name", () => {
    render(<EditProfileForm user={mockUser} />);
    const nameInput = screen.getByLabelText(/display name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Disney Fan");
  });

  it("renders a profile picture input", () => {
    render(<EditProfileForm user={mockUser} />);
    expect(screen.getByLabelText(/profile picture/i)).toBeDefined();
  });

  it("renders a save button", () => {
    render(<EditProfileForm user={mockUser} />);
    expect(screen.getByRole("button", { name: /save/i })).toBeDefined();
  });

  it("calls update with the user id and form data on submit", async () => {
    render(<EditProfileForm user={mockUser} />);

    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledOnce());
    expect(mockUpdate).toHaveBeenCalledWith("user1", expect.any(FormData));
  });

  it("refreshes the auth store after a successful save", async () => {
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(mockSave).toHaveBeenCalledOnce());
    expect(mockSave).toHaveBeenCalledWith("test-token", expect.objectContaining({ name: "Updated Name" }));
  });

  it("shows a success message after saving", async () => {
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile updated/i)).toBeDefined();
    });
  });

  it("shows an error message when the save fails", async () => {
    mockUpdate.mockRejectedValue(new Error("Server error"));
    render(<EditProfileForm user={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeDefined();
    });
  });

  it("disables the save button while saving", async () => {
    let resolveUpdate!: (val: RecordModel) => void;
    mockUpdate.mockImplementation(() => new Promise<RecordModel>(res => { resolveUpdate = res; }));

    render(<EditProfileForm user={mockUser} />);
    const button = screen.getByRole("button", { name: /save/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button.hasAttribute("disabled")).toBe(true);
    });

    resolveUpdate({ ...mockUser });
  });
});
