"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/app/components/LoginModal/LoginModal";

export function GlobalLoginModal() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginOpen(true);
    };

    // Listen for the custom event to open the login modal
    window.addEventListener('openLoginModal', handleOpenLoginModal);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  return (
    <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
  );
}