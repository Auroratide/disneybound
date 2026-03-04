"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <Button
        variant="destructive"
        size="icon-sm"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete outfit"
      >
        <Trash2 />
      </Button>
      {error && (
        <p className="text-xs text-destructive bg-background/90 px-1 py-0.5 rounded">
          Could not delete
        </p>
      )}
    </div>
  );
}
