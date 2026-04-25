"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as Icon from "@/app/components/Icon/Icon";
import { Button } from "@/components/ui/button";

export function DeleteOutfitButton({ id, imageUrl }: { id: string; imageUrl: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
  }, [isOpen]);

  function handleOpen() {
    setError(false);
    setIsOpen(true);
  }

  function handleCancel() {
    if (isDeleting) return;
    setIsOpen(false);
  }

  async function handleDelete() {
    setError(false);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community-outfits/${id}`, { method: "DELETE" });
      if (res.status === 204) {
        setIsOpen(false);
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
    <>
      <button
        onClick={handleOpen}
        aria-label="Delete outfit"
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white border border-foreground/20 shadow flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
      >
        <Icon.X className="w-3.5 h-3.5 text-foreground" />
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          onCancel={(e) => { e.preventDefault(); handleCancel(); }}
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 m-auto flex h-full w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-black/60"
        >
          <div className="bg-card rounded-2xl w-full max-w-sm flex flex-col gap-4 p-6">
            <h2 id="delete-confirm-title" className="text-lg font-semibold text-center">
              Remove this outfit?
            </h2>

            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-border">
              <Image src={imageUrl} alt="Outfit to remove" fill className="object-contain" />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">
                Something went wrong. Please try again.
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <><Icon.Loader2 className="w-4 h-4 animate-spin" /> Removing…</>
                ) : (
                  error ? "Try again" : "Remove"
                )}
              </Button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
