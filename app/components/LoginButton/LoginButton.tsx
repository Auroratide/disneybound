"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

export function LoginButton() {
  return (
    <Button onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal'))}>
      Log in
    </Button>
  );
}