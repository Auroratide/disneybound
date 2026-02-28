"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";
import { LoginModal } from "@/app/components/LoginModal/LoginModal";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-sm font-semibold hover:text-muted-foreground transition-colors">
        Disney Bounding
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link
              href="/account"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {user.name || user.email}
            </Link>
            <button
              onClick={logout}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsLoginOpen(true)}
            className="font-medium hover:text-muted-foreground transition-colors"
          >
            Log in
          </button>
        )}
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
}
