"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "otp";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { requestOtp, confirmOtp } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
  }, [isOpen]);

  if (!isOpen) return null;

  function handleCancel(e: React.SyntheticEvent) {
    e.preventDefault();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) onClose();
  }

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
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="login-modal-title"
      className="fixed inset-0 m-auto flex h-full w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-black/50"
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 text-foreground shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 id="login-modal-title" className="text-lg font-semibold">Log in</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>

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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send code"}
          </Button>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setStep("email"); setError(null); setCode(""); }}
            >
              Back
            </Button>
          </div>
        </form>
      )}
      </div>
    </dialog>
  );
}
