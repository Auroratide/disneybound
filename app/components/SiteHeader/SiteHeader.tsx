"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";
import { LoginModal } from "@/app/components/LoginModal/LoginModal";
import { Button } from "@/components/ui/button";

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
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)}>
            Log in
          </Button>
        )}
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
}
