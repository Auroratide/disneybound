"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import type { CommunityOutfit } from "@/app/data/community-outfits";
import { OutfitCard } from "@/app/components/OutfitCard/OutfitCard";
import { useAuth } from "@/app/components/AuthProvider/AuthProvider";
import { LoginModal } from "@/app/components/LoginModal/LoginModal";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";

interface CommunityOutfitsSectionProps {
  outfits: CommunityOutfit[];
  currentUserId: string | null;
  characterSlug: string;
  outfitName: string;
  instructions?: React.ReactNode;
}

export function CommunityOutfitsSection({
  outfits,
  currentUserId,
  characterSlug,
  outfitName,
  instructions,
}: CommunityOutfitsSectionProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(outfits.length === 0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    if (selected) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a photo first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("character_slug", characterSlug);
    formData.append("outfit_name", outfitName);
    formData.append("image", file);

    try {
      const res = await fetch("/api/community-outfits", { method: "POST", body: formData });
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

  function handleCancel() {
    setIsExpanded(false);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  const uploadFormId = `upload-form-${characterSlug}-${outfitName.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl">
          Community Outfits
        </h3>
        {!isSuccess && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={uploadFormId}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-80 transition-opacity"
          >
            <Camera className="w-4 h-4" />
            {isExpanded ? "Hide" : "Share yours"}
          </button>
        )}
      </div>

      {/* Upload form */}
      {isExpanded && (
        <div id={uploadFormId} className="mb-8">
          {instructions && user && (
            <p className="text-base text-foreground mb-4 text-center">{instructions}</p>
          )}
          {!user ? (
            <div className="flex flex-col gap-3 text-center">
              <p className="text-base text-foreground">Log in to share your bounding outfit.<br />An account allows you to remove photos you&apos;ve uploaded at any time.</p>
              <p className="text-center">
                <Button size="default" className="self-start" onClick={() => setIsLoginOpen(true)}>
                  Log in
                </Button>
              </p>
              <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            </div>
          ) : isSuccess ? (
            <p className="text-sm text-green-700">Thanks! Your outfit will appear after review.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              {/* Polaroid upload card */}
              <figure className="w-64">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white shadow-md p-2 pb-0 block text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary group"
                  aria-label="Select outfit photo"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center group-hover:brightness-95 transition-[filter]">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Your outfit preview"
                        fill
                        className="object-cover"
                        sizes="256px"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground px-4 text-center">
                        <Camera className="w-10 h-10" />
                        <span className="text-sm leading-tight">Tap to add your photo</span>
                      </div>
                    )}
                  </div>
                  <figcaption className="px-1 py-2 text-sm text-muted-foreground truncate">
                    {previewUrl ? "Looking good!" : "Your outfit"}
                  </figcaption>
                </button>
              </figure>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Outfit photo"
              />

              <ErrorMessage message={error} />

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sharing…" : "Share outfit"}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Outfit grid */}
      {outfits.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {outfits.map((outfit) => (
            <li key={outfit.id}>
              <OutfitCard
                outfit={outfit}
                alt={outfit.userName ? `Outfit by ${outfit.userName}` : "Community outfit"}
                caption={<UserCaption outfit={outfit} />}
                showDelete={currentUserId != null && outfit.userId === currentUserId}
                sizes="(min-width: 640px) 33vw, 50vw"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UserCaption({ outfit }: { outfit: CommunityOutfit }) {
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-muted border border-foreground/10">
        {outfit.avatarUrl ? (
          <Image
            src={outfit.avatarUrl}
            alt={outfit.userName ?? ""}
            width={28}
            height={28}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
            {outfit.userName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
      <p className="text-base font-medium text-foreground truncate">
        {outfit.userName ?? "Anonymous"}
      </p>
    </div>
  );
}
