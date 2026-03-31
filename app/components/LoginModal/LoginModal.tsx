"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "username" | "otp";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { checkEmail, register, confirmOtp } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [existingUsername, setExistingUsername] = useState<string | null>(null);
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

  function handleBack() {
    setStep("email");
    setOtpId("");
    setCode("");
    setUsername("");
    setExistingUsername(null);
    setError(null);
  }

  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await checkEmail(email);
      if (result.status === "existing") {
        setOtpId(result.otpId);
        setExistingUsername(result.username);
        setStep("otp");
      } else {
        setStep("username");
      }
    } catch {
      setError("Could not send a code. Please check your email and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await register(email, username);
      setOtpId(result.otpId);
      setStep("otp");
    } catch {
      setError("Could not create your account. Please try again.");
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
      // Full reset so the next login starts fresh with no prepopulated email.
      setStep("email");
      setEmail("");
      setOtpId("");
      setCode("");
      setUsername("");
      setExistingUsername(null);
      setError(null);
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
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 text-foreground shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 id="login-modal-title" className="text-lg font-semibold">Log in</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>

        {step === "email" && (
          <form onSubmit={handleCheckEmail} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              An account allows you to upload your personal outfits of Disney characters.
            </p>
            <div className="flex flex-col gap-1">
              <label htmlFor="login-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-white"
              />
            </div>

            <ErrorMessage message={error} />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send code"}
            </Button>
          </form>
        )}

        {step === "username" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Welcome! Choose a display name to create your account.
            </p>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-username" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                className="bg-white"
              />
            </div>

            <ErrorMessage message={error} />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <Button type="button" variant="ghost" onClick={handleBack}>
                Back
              </Button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleConfirmOtp} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {existingUsername
                ? <>Welcome back, <strong>{existingUsername}</strong>! We sent a 6-digit code to <strong>{email}</strong>.</>
                : <>We sent a 6-digit code to <strong>{email}</strong>.</>
              }
            </p>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-code" className="text-sm font-medium">
                Code from Email
              </label>
              <Input
                id="login-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                autoFocus
                className="tracking-widest bg-white"
              />
            </div>

            <ErrorMessage message={error} />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button type="button" variant="ghost" onClick={handleBack}>
                Back
              </Button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
