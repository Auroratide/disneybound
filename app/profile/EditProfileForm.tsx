"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, User } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";

interface EditProfileFormProps {
  user: RecordModel;
  avatarUrl: string | null;
}

export function EditProfileForm({ user, avatarUrl }: EditProfileFormProps) {
  const [name, setName] = useState<string>(user.name ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);

    const avatarFile = formData.get("avatar");
    if (avatarFile instanceof File && avatarFile.size === 0) {
      formData.delete("avatar");
    }

    try {
      const pb = getPocketbase();
      const updatedRecord = await pb.collection("users").update(user.id, formData);
      pb.authStore.save(pb.authStore.token, updatedRecord);
      setIsSuccess(true);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar circle with upload button */}
      <div className="relative w-24 h-24 shrink-0">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {previewUrl ? (
            <Image src={previewUrl} alt="Your avatar" fill className="object-cover" />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <label
          htmlFor="profile-avatar"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Upload profile picture"
        >
          <Upload className="w-4 h-4 text-primary-foreground" />
        </label>
        <input
          id="profile-avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-3 w-full">
        <h1 className="text-2xl font-bold text-primary">Profile</h1>

        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="profile-name" className="text-sm font-medium">
              Display name
            </label>
            <Input
              id="profile-name"
              name="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>

        <ErrorMessage message={error} />
        {isSuccess && (
          <p className="text-sm text-green-600">Profile updated!</p>
        )}
      </div>
    </form>
  );
}
