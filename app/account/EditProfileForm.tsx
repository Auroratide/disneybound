"use client";

import { useState } from "react";
import type { RecordModel } from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";

interface EditProfileFormProps {
  user: RecordModel;
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const [name, setName] = useState<string>(user.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);

    // Don't send an empty file — PocketBase would reject it.
    const avatarFile = formData.get("avatar");
    if (avatarFile instanceof File && avatarFile.size === 0) {
      formData.delete("avatar");
    }

    try {
      const pb = getPocketbase();
      const updatedRecord = await pb.collection("users").update(user.id, formData);
      // Refresh the auth store so the site header reflects the new name/avatar.
      pb.authStore.save(pb.authStore.token, updatedRecord);
      setIsSuccess(true);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
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

      <div className="flex flex-col gap-1">
        <label htmlFor="profile-avatar" className="text-sm font-medium">
          Profile picture
        </label>
        <Input
          id="profile-avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file:mr-3 file:rounded file:bg-muted file:px-3 file:py-1"
        />
      </div>

      <ErrorMessage message={error} />

      {isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400">Profile updated!</p>
      )}

      <Button type="submit" disabled={isLoading} className="self-start">
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
