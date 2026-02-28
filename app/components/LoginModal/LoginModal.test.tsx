import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockRequestOtp = vi.fn();
const mockConfirmOtp = vi.fn();

vi.mock("@/app/components/AuthProvider/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    requestOtp: mockRequestOtp,
    confirmOtp: mockConfirmOtp,
    logout: vi.fn(),
  }),
}));

const { LoginModal } = await import("./LoginModal");

const onClose = vi.fn();

beforeEach(() => {
  mockRequestOtp.mockResolvedValue({ otpId: "otp-123" });
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

  it("transitions to the OTP step after requesting a code", async () => {
    render(<LoginModal isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/code/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /verify/i })).toBeDefined();
    });
    expect(mockRequestOtp).toHaveBeenCalledWith("user@example.com");
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

  it("shows an error when requestOtp fails", async () => {
    mockRequestOtp.mockRejectedValue(new Error("Network error"));

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

  it("closes when the backdrop is clicked", () => {
    render(<LoginModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });
});
