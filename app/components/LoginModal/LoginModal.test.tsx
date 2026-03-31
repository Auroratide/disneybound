import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockCheckEmail = vi.fn();
const mockRegister = vi.fn();
const mockConfirmOtp = vi.fn();

vi.mock("@/app/components/AuthProvider/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    checkEmail: mockCheckEmail,
    register: mockRegister,
    confirmOtp: mockConfirmOtp,
    logout: vi.fn(),
  }),
}));

const { LoginModal } = await import("./LoginModal");

const onClose = vi.fn();

beforeEach(() => {
  mockCheckEmail.mockResolvedValue({ status: "existing", otpId: "otp-123", username: "DisneyFan" });
  mockRegister.mockResolvedValue({ otpId: "otp-456" });
  mockConfirmOtp.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("LoginModal", () => {
  it("renders nothing when closed", () => {
    render(<LoginModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the email step when open", () => {
    render(<LoginModal isOpen={true} onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /send code/i })).toBeDefined();
  });

  describe("existing user flow", () => {
    it("goes straight to the OTP step for an existing account", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/code/i)).toBeDefined();
        expect(screen.queryByLabelText(/display name/i)).toBeNull();
      });
      expect(mockCheckEmail).toHaveBeenCalledWith("user@example.com");
    });

    it("shows a welcome back greeting with the username on the OTP step", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeDefined();
        expect(screen.getByText("DisneyFan")).toBeDefined();
      });
    });

    it("calls confirmOtp with the correct otpId and code, then closes", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));

      await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeDefined());

      fireEvent.change(screen.getByLabelText(/code/i), {
        target: { value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      await waitFor(() => {
        expect(mockConfirmOtp).toHaveBeenCalledWith("otp-123", "123456");
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("new user flow", () => {
    beforeEach(() => {
      mockCheckEmail.mockResolvedValue({ status: "new" });
    });

    it("shows the username step for a new account", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "new@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toBeDefined();
        expect(screen.getByRole("button", { name: /create account/i })).toBeDefined();
      });
    });

    it("does not show a welcome back greeting for new users", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "new@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() => expect(screen.getByLabelText(/display name/i)).toBeDefined());

      fireEvent.change(screen.getByLabelText(/display name/i), {
        target: { value: "BrandNewUser" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeDefined());
      expect(screen.queryByText(/welcome back/i)).toBeNull();
    });

    it("calls register with email and username, then proceeds to OTP", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "new@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() => expect(screen.getByLabelText(/display name/i)).toBeDefined());

      fireEvent.change(screen.getByLabelText(/display name/i), {
        target: { value: "BrandNewUser" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith("new@example.com", "BrandNewUser");
        expect(screen.getByLabelText(/code/i)).toBeDefined();
      });
    });
  });

  describe("back navigation", () => {
    it("goes back to the email step from the username step", async () => {
      mockCheckEmail.mockResolvedValue({ status: "new" });
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "new@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() => expect(screen.getByLabelText(/display name/i)).toBeDefined());

      fireEvent.click(screen.getByRole("button", { name: /back/i }));

      expect(screen.getByLabelText(/email/i)).toBeDefined();
    });

    it("goes back to the email step from the OTP step", async () => {
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeDefined());

      fireEvent.click(screen.getByRole("button", { name: /back/i }));

      expect(screen.getByLabelText(/email/i)).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("shows an error when checkEmail fails", async () => {
      mockCheckEmail.mockRejectedValue(new Error("Network error"));
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /send code/i })).toBeDefined();
        expect(screen.getByText(/could not send/i)).toBeDefined();
      });
    });

    it("shows an error when register fails", async () => {
      mockCheckEmail.mockResolvedValue({ status: "new" });
      mockRegister.mockRejectedValue(new Error("Server error"));
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "new@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() => expect(screen.getByLabelText(/display name/i)).toBeDefined());

      fireEvent.change(screen.getByLabelText(/display name/i), {
        target: { value: "NewUser" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/could not create/i)).toBeDefined();
        expect(screen.getByLabelText(/display name/i)).toBeDefined();
      });
    });

    it("shows an error when confirmOtp fails", async () => {
      mockConfirmOtp.mockRejectedValue(new Error("Invalid code"));
      render(<LoginModal isOpen={true} onClose={onClose} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeDefined());

      fireEvent.change(screen.getByLabelText(/code/i), {
        target: { value: "000000" },
      });
      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired/i)).toBeDefined();
      });
    });
  });

  it("closes when the backdrop is clicked", () => {
    render(<LoginModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });
});
