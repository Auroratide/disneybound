"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import * as Icon from "@/app/components/Icon/Icon";
import type { RecordModel } from "pocketbase";
import { getPocketbase } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";

async function patchProfile(formData: FormData): Promise<{ name: string; avatarUrl: string | null; avatarFilename: string | null }> {
  const res = await fetch("/api/users/me", { method: "PATCH", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update profile");
  }
  return res.json();
}

interface EditProfileFormProps {
  user: RecordModel;
  avatarUrl?: string | null;
}

export function EditProfileForm({ user: serverUser, avatarUrl: serverAvatarUrl = null }: EditProfileFormProps) {
  const [name, setName] = useState<string>(serverUser.name ?? "");
  const [editingName, setEditingName] = useState<string>(serverUser.name ?? "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(serverAvatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>(serverUser.email ?? "");

  // Sync from client-side authStore on mount — always up to date after saves
  useEffect(() => {
    const pb = getPocketbase();
    const record = pb.authStore.record;
    if (!record) return;

    const currentName = record.name ?? "";
    setName(currentName);
    setEditingName(currentName);
    setEmail(record.email ?? serverUser.email ?? "");

    if (record.avatar) {
      setPreviewUrl(pb.files.getURL(record, record.avatar));
    }
  }, [serverUser.email]);

  // Avatar: auto-save immediately when a file is picked
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setAvatarError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const { avatarUrl, avatarFilename } = await patchProfile(formData);
      const pb = getPocketbase();
      pb.authStore.save(pb.authStore.token, { ...pb.authStore.record!, avatar: avatarFilename ?? "" });
      if (avatarUrl) setPreviewUrl(avatarUrl);
    } catch {
      setAvatarError("Failed to upload photo.");
      setPreviewUrl(serverAvatarUrl);
    }
  }

  function handleEditName() {
    setEditingName(name);
    setNameError(null);
    setNameSuccess(false);
    setIsEditingName(true);
  }

  function handleCancelName() {
    setIsEditingName(false);
    setEditingName(name);
    setNameError(null);
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingName(true);
    setNameError(null);
    setNameSuccess(false);

    const formData = new FormData();
    formData.append("name", editingName);

    try {
      const { name: savedName } = await patchProfile(formData);
      const pb = getPocketbase();
      pb.authStore.save(pb.authStore.token, { ...pb.authStore.record!, name: savedName });
      setName(savedName);
      setIsEditingName(false);
      setNameSuccess(true);
    } catch {
      setNameError("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar circle with upload button */}
      <div className="shrink-0">
        <div className="relative w-32 h-32">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {previewUrl ? (
              <Image src={previewUrl} alt="Your avatar" fill sizes="128px" className="object-cover" />
            ) : (
              <Icon.User className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <label
            htmlFor="profile-avatar"
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Upload profile picture"
          >
            <Icon.Upload className="w-4 h-4 text-primary-foreground" />
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
        {avatarError && <p className="text-xs text-destructive mt-1">{avatarError}</p>}
      </div>

      {/* Profile fields */}
      <div className="flex flex-col gap-3 w-full">
        <h1 className="text-2xl font-bold text-primary">Profile</h1>

        {/* Display name */}
        <div>
          <div className="flex items-center gap-1">
            <label htmlFor="profile-name" className="text-sm text-muted-foreground">Display name</label>
            {!isEditingName && (
              <button
                type="button"
                onClick={handleEditName}
                aria-label="Edit display name"
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon.Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
              <Input
                id="profile-name"
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                autoFocus
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={isSavingName}>
                {isSavingName ? "Saving…" : "Save"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleCancelName} aria-label="Cancel editing">
                <Icon.X className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <p className="text-sm font-medium mt-1">{name || <span className="text-muted-foreground italic">Not set</span>}</p>
          )}
          {nameError && <ErrorMessage message={nameError} />}
          {nameSuccess && <p className="text-sm text-green-600 mt-1">Name updated!</p>}
        </div>

        {/* Email */}
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{email}</p>
        </div>
      </div>
    </div>
  );
}
