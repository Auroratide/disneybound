"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RecordModel } from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";

interface AuthContextValue {
  user: RecordModel | null;
  requestOtp: (email: string) => Promise<{ otpId: string }>;
  confirmOtp: (otpId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pb = getPocketbase();
    // fireImmediately=true hydrates from localStorage on mount, then continues
    // to fire on subsequent auth changes (login, logout, token refresh).
    return pb.authStore.onChange(() => {
      setUser(pb.authStore.record);
    }, true);
  }, []);

  async function requestOtp(email: string) {
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Failed to request OTP");
    const data = await res.json();
    return { otpId: data.otpId as string };
  }

  async function confirmOtp(otpId: string, code: string) {
    const res = await fetch("/api/auth/confirm-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, code }),
    });
    if (!res.ok) throw new Error("Invalid or expired code");
    const { token, record } = await res.json();
    // Sync token into the client-side PocketBase store so the UI reflects the login.
    const pb = getPocketbase();
    pb.authStore.save(token, record);
    // authStore.onChange fires automatically, updating user state.
    // Refresh server components so they re-render with the new auth (e.g. delete buttons appear).
    router.refresh();
  }

  async function logout() {
    // Await cookie clearance before refreshing so the server sees the cleared cookie.
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    const pb = getPocketbase();
    pb.authStore.clear();
    // authStore.onChange fires automatically, clearing user state.
    // Refresh server components so they re-render without auth (e.g. profile page redirects).
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ user, requestOtp, confirmOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
