"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Icon from "@/app/components/Icon/Icon";

export function DeleteOutfitButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(false);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community-outfits/${id}`, { method: "DELETE" });
      if (res.status === 204) {
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete outfit"
        className="w-6 h-6 rounded-full bg-white border border-foreground/20 shadow flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Icon.X className="w-3.5 h-3.5 text-foreground" />
      </button>
      {error && (
        <p className="text-xs text-destructive bg-background/90 px-1 py-0.5 rounded">
          Could not delete
        </p>
      )}
    </div>
  );
}
