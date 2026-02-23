"use client";

import { useState, useRef } from "react";

interface UploadOutfitFormProps {
  characterSlug: string;
  outfitName: string;
}

export function UploadOutfitForm({ characterSlug, outfitName }: UploadOutfitFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    if (name.trim()) {
      formData.append("submitter_name", name.trim());
    }

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
        <input
          id="outfit-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium"
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

      <div className="flex flex-col gap-1">
        <label htmlFor="submitter-name" className="text-sm font-medium">
          Your name or handle (optional)
        </label>
        <input
          id="submitter-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? "Sharing..." : "Share outfit"}
      </button>
    </form>
  );
}
