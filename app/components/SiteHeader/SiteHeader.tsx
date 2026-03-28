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
    <header className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "color-mix(in oklch, var(--primary) 70%, black)" }}>
      <Link href="/" className="font-display text-2xl font-bold text-primary-foreground hover:opacity-80 transition-opacity">
        Disney Bounding
      </Link>

      <nav className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/account"
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {user.name || user.email}
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
            >
              Log out
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLoginOpen(true)}
            className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
          >
            Log in
          </Button>
        )}
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
}
