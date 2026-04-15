"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { hexToOklch } from "@/app/lib/hex-to-oklch";

type ColorEntry = {
  hex: string;
  name: string;
};

type FormData = {
  name: string;
  movie: string;
  outfitName: string;
  colors: [ColorEntry, ColorEntry, ColorEntry];
  image: File | null;
  previewUrl: string | null;
};

const INITIAL_COLOR: ColorEntry = { hex: "#cccccc", name: "" };

const COLOR_ROLES = ["Primary", "Secondary", "Accessory"] as const;

const STEPS = ["Character", "Image", "Colors", "Review"];

export function SuggestCharacterForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    name: "",
    movie: "",
    outfitName: "",
    colors: [{ ...INITIAL_COLOR }, { ...INITIAL_COLOR }, { ...INITIAL_COLOR }],
    image: null,
    previewUrl: null,
  });
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateColor(index: number, patch: Partial<ColorEntry>) {
    setData((prev) => {
      const colors = prev.colors.map((c, i) => i === index ? { ...c, ...patch } : c) as [ColorEntry, ColorEntry, ColorEntry];
      return { ...prev, colors };
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (data.previewUrl) URL.revokeObjectURL(data.previewUrl);
    setData((prev) => ({
      ...prev,
      image: file,
      previewUrl: file ? URL.createObjectURL(file) : null,
    }));
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!data.name.trim()) return "Character name is required.";
      if (!data.movie.trim()) return "Movie or show is required.";
      if (!data.outfitName.trim()) return "Outfit name is required.";
    }
    if (step === 1) {
      if (!data.image) return "Please select an image.";
    }
    if (step === 2) {
      for (let i = 0; i < 3; i++) {
        if (!data.colors[i].name.trim()) return `${COLOR_ROLES[i]} color needs a name.`;
      }
    }
    return null;
  }

  function handleNext() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError(null);
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStepError(null);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    setExistingSlug(null);

    const colors = data.colors.map((c) => ({
      name: c.name.trim(),
      oklch: hexToOklch(c.hex),
    }));

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("movie", data.movie.trim());
    formData.append("outfit_name", data.outfitName.trim());
    formData.append("colors", JSON.stringify(colors));
    formData.append("image", data.image!);

    try {
      const res = await fetch("/api/characters", { method: "POST", body: formData });
      if (res.status === 201) {
        setSuccess(true);
      } else if (res.status === 409) {
        const body = await res.json();
        setExistingSlug(body.slug ?? null);
        setSubmitError("This character outfit already exists.");
      } else {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-4">
        <p className="text-2xl font-bold">Thanks for your suggestion!</p>
        <p className="text-muted-foreground">Your character outfit will appear on the site after review.</p>
        <Link href="/" className="text-sm text-primary hover:underline">← Back to all characters</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <ol className="flex items-center gap-2 mb-8" aria-label="Form steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              i === step
                ? "bg-primary text-primary-foreground border-primary"
                : i < step
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-muted text-muted-foreground border-border"
            }`}>
              {i + 1}
            </span>
            <span className={`text-sm font-medium hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="text-border mx-1">›</span>}
          </li>
        ))}
      </ol>

      {/* Step 1: Character info */}
      {step === 0 && (
        <fieldset className="flex flex-col gap-4">
          <legend className="text-lg font-semibold mb-2">Character info</legend>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suggest-name" className="text-sm font-medium">Character name</label>
            <Input
              id="suggest-name"
              value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Moana"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suggest-movie" className="text-sm font-medium">Movie or show</label>
            <Input
              id="suggest-movie"
              value={data.movie}
              onChange={(e) => setData((p) => ({ ...p, movie: e.target.value }))}
              placeholder="e.g. Moana"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suggest-outfit" className="text-sm font-medium">Outfit name</label>
            <Input
              id="suggest-outfit"
              value={data.outfitName}
              onChange={(e) => setData((p) => ({ ...p, outfitName: e.target.value }))}
              placeholder="e.g. Ocean Dress"
            />
          </div>
        </fieldset>
      )}

      {/* Step 2: Image */}
      {step === 1 && (
        <fieldset className="flex flex-col gap-4">
          <legend className="text-lg font-semibold mb-2">Character image</legend>
          <p className="text-sm text-muted-foreground -mt-2">Upload a clear render or artwork of the character in this outfit. JPEG, PNG, or WebP — max 5 MB.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-muted/40 transition-colors cursor-pointer"
          >
            {data.previewUrl ? (
              <div className="relative w-48 h-48">
                <Image src={data.previewUrl} alt="Preview" fill className="object-contain rounded-lg" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm0 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span className="text-sm">Click to select image</span>
              </div>
            )}
            {data.image && (
              <span className="text-xs text-muted-foreground">{data.image.name}</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleImageChange}
            aria-label="Character image"
          />
        </fieldset>
      )}

      {/* Step 3: Colors */}
      {step === 2 && (
        <fieldset className="flex flex-col gap-6">
          <legend className="text-lg font-semibold mb-2">Color palette</legend>
          <p className="text-sm text-muted-foreground -mt-4">Pick 3 colors that define this outfit. Sample them from reference art for accuracy.</p>
          {data.colors.map((color, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <label
                  htmlFor={`suggest-color-${i}`}
                  className="text-sm font-semibold shrink-0 w-20"
                >
                  {COLOR_ROLES[i]}
                </label>
                <input
                  id={`suggest-color-${i}`}
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateColor(i, { hex: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-border p-0.5 bg-card"
                />
                <span
                  className="flex-1 h-10 rounded-lg border border-foreground/10"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`suggest-color-name-${i}`} className="text-sm font-medium">Color name</label>
                <Input
                  id={`suggest-color-name-${i}`}
                  value={color.name}
                  onChange={(e) => updateColor(i, { name: e.target.value })}
                  placeholder="e.g. Teal"
                />
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold">Review your submission</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2"><dt className="text-muted-foreground w-24 shrink-0">Character</dt><dd className="font-medium">{data.name}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24 shrink-0">Movie</dt><dd className="font-medium">{data.movie}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24 shrink-0">Outfit</dt><dd className="font-medium">{data.outfitName}</dd></div>
          </dl>
          <div className="flex gap-3">
            {data.colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="w-full aspect-square rounded-lg border border-foreground/10" style={{ backgroundColor: c.hex }} />
                <span className="text-xs font-medium text-center leading-tight">{c.name || `Color ${i + 1}`}</span>
              </div>
            ))}
          </div>
          {data.previewUrl && (
            <div className="relative w-32 h-32">
              <Image src={data.previewUrl} alt="Character preview" fill className="object-contain rounded-lg" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">Your submission will appear after review. You won&apos;t be able to edit it after submitting.</p>
          <ErrorMessage message={submitError} />
          {existingSlug && (
            <p className="text-sm">
              <Link href={`/characters/${existingSlug}`} className="text-primary underline">View the existing page →</Link>
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-8">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        <ErrorMessage message={stepError} />
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>Next</Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
