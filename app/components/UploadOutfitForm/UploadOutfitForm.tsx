"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";
import { LoginModal } from "@/app/components/LoginModal/LoginModal";

interface UploadOutfitFormProps {
  characterSlug: string;
  outfitName: string;
}

export function UploadOutfitForm({ characterSlug, outfitName }: UploadOutfitFormProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const prevPreviewUrl = useRef<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);

    if (prevPreviewUrl.current) {
      URL.revokeObjectURL(prevPreviewUrl.current);
    }

    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      prevPreviewUrl.current = url;
    } else {
      setPreviewUrl(null);
      prevPreviewUrl.current = null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Photo is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("character_slug", characterSlug);
    formData.append("outfit_name", outfitName);
    formData.append("image", file);

    try {
      const res = await fetch("/api/community-outfits", {
        method: "POST",
        body: formData,
      });

      if (res.status === 201) {
        setIsSuccess(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Log in to share your outfit.</p>
        <Button variant="outline" size="sm" className="self-start" onClick={() => setIsLoginOpen(true)}>
          Log in
        </Button>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <p className="text-sm text-green-600 dark:text-green-400">
        Thanks! Your outfit will appear after review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="outfit-photo" className="text-sm font-medium">
          Outfit photo
        </label>
        <Input
          id="outfit-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="file:mr-3 file:rounded file:bg-muted file:px-3 file:py-1"
        />
      </div>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg"
        />
      )}

      <ErrorMessage message={error} />

      <Button
        type="submit"
        disabled={isLoading}
        className="self-start"
      >
        {isLoading ? "Sharing..." : "Share outfit"}
      </Button>
    </form>
  );
}
