"use client";

import { useState } from "react";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "otp";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { requestOtp, confirmOtp } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await requestOtp(email);
      setOtpId(result.otpId);
      setStep("otp");
    } catch {
      setError("Could not send a code. Please check your email and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await confirmOtp(otpId, code);
      onClose();
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Log in" className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-semibold mb-4">Log in</h2>

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="rounded border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmOtp} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <strong>{email}</strong>.
            </p>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-code" className="text-sm font-medium">
                Code
              </label>
              <input
                id="login-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                autoFocus
                className="rounded border border-border bg-background px-3 py-1.5 text-sm tracking-widest"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(null); setCode(""); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
