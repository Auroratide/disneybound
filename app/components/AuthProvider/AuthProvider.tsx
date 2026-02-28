"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { RecordModel } from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";

interface AuthContextValue {
  user: RecordModel | null;
  requestOtp: (email: string) => Promise<{ otpId: string }>;
  confirmOtp: (otpId: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(null);

  useEffect(() => {
    const pb = getPocketbase();
    // fireImmediately=true hydrates from localStorage on mount, then continues
    // to fire on subsequent auth changes (login, logout, token refresh).
    return pb.authStore.onChange(() => {
      setUser(pb.authStore.record);
    }, true);
  }, []);

  async function requestOtp(email: string) {
    const pb = getPocketbase();
    const result = await pb.collection("users").requestOTP(email);
    return { otpId: result.otpId };
  }

  async function confirmOtp(otpId: string, code: string) {
    const pb = getPocketbase();
    await pb.collection("users").authWithOTP(otpId, code);
    // authStore.onChange fires automatically, updating user state.
  }

  function logout() {
    const pb = getPocketbase();
    pb.authStore.clear();
    // authStore.onChange fires automatically, clearing user state.
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
