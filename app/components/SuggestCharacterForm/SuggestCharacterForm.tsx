"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { hexToOklch } from "@/app/lib/hex-to-oklch";
import { nearestColorName } from "@/app/lib/color-naming";
import { Outfit } from "@/app/components/Outfit";

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
  const [activePickSlot, setActivePickSlot] = useState<number | null>(null);
  const [hoverColor, setHoverColor] = useState<{ hex: string; x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickerDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (activePickSlot !== null) pickerDialogRef.current?.showModal();
  }, [activePickSlot]);

  useEffect(() => {
    if (activePickSlot === null || !canvasRef.current || !data.previewUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.src = data.previewUrl;
  }, [activePickSlot, data.previewUrl]);

  function sampleColor(e: React.MouseEvent<HTMLCanvasElement>): string | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  function handleCanvasPick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (activePickSlot === null) return;
    const hex = sampleColor(e);
    if (!hex) return;
    setData((prev) => {
      const colors = prev.colors.map((c, i) => {
        if (i !== activePickSlot) return c;
        return { hex, name: nearestColorName(hex) };
      }) as [ColorEntry, ColorEntry, ColorEntry];
      return { ...prev, colors };
    });
    setActivePickSlot(null);
    setHoverColor(null);
  }

  function handleCanvasMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const hex = sampleColor(e);
    if (!hex) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setHoverColor({ hex, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleCanvasLeave() {
    setHoverColor(null);
  }

  function updateColor(index: number, patch: Partial<ColorEntry>) {
    setData((prev) => {
      const colors = prev.colors.map((c, i) => i === index ? { ...c, ...patch } : c) as [ColorEntry, ColorEntry, ColorEntry];
      return { ...prev, colors };
    });
  }

  useEffect(() => {
    if (step !== 1) return;

    function handlePaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.type.startsWith("image/")
      );
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      setData((prev) => {
        if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { ...prev, image: file, previewUrl: URL.createObjectURL(file) };
      });
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [step]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setData((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { ...prev, image: file, previewUrl: file ? URL.createObjectURL(file) : null };
    });
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
    <div>
      {/* Step indicator */}
      <ol className="flex items-start mb-8 max-w-lg mx-auto" aria-label="Form steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-start flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold border-2 transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground border-primary"
                  : i < step
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-muted text-muted-foreground border-border"
              }`}>
                {i + 1}
              </span>
              <span className={`text-sm font-medium text-center leading-tight ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className="text-border mt-4 shrink-0" aria-hidden="true">›</span>}
          </li>
        ))}
      </ol>

      {/* Step 1: Character info */}
      {step === 0 && (
        <fieldset className="flex flex-col gap-4 max-w-lg mx-auto">
          <legend className="text-lg font-semibold mb-2 font-display text-primary">Character info</legend>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suggest-name" className="text-sm font-medium">Character name</label>
            <Input
              id="suggest-name"
              value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Moana"
              autoFocus
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suggest-movie" className="text-sm font-medium">Movie or show</label>
            <Input
              id="suggest-movie"
              value={data.movie}
              onChange={(e) => setData((p) => ({ ...p, movie: e.target.value }))}
              placeholder="e.g. Moana"
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suggest-outfit" className="text-sm font-medium">Outfit name</label>
            <Input
              id="suggest-outfit"
              value={data.outfitName}
              onChange={(e) => setData((p) => ({ ...p, outfitName: e.target.value }))}
              placeholder="e.g. Ocean Dress"
              className="bg-white"
            />
          </div>
        </fieldset>
      )}

      {/* Step 2: Image */}
      {step === 1 && (
        <fieldset className="flex flex-col gap-4 max-w-lg mx-auto">
          <legend className="text-lg font-semibold mb-2 font-display text-primary">Character image</legend>
          <p className="text-sm text-muted-foreground -mt-2">Upload a clear render or artwork of the character in this outfit. JPEG, PNG, or WebP — max 5 MB.</p>
          {/* contentEditable enables right-click → Paste in the browser context menu */}
          <div
            contentEditable="true"
            suppressContentEditableWarning={true}
            role="button"
            aria-label="Upload Character Image"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onBeforeInput={(e) => e.preventDefault()}
            onPaste={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const item = Array.from(e.clipboardData?.items ?? []).find(
                (i) => i.type.startsWith("image/")
              );
              if (!item) return;
              const file = item.getAsFile();
              if (!file) return;
              setData((prev) => {
                if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
                return { ...prev, image: file, previewUrl: URL.createObjectURL(file) };
              });
            }}
            className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-muted/40 transition-colors cursor-pointer [caret-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleImageChange}
            aria-label="Character image"
          />
          <p className="text-xs text-muted-foreground text-center hidden sm:block">
            You can also paste an image with Ctrl+V / ⌘V, or right-click the box above
          </p>
        </fieldset>
      )}

      {/* Step 3: Colors */}
      {step === 2 && (
        <fieldset className="flex flex-col gap-6 max-w-lg mx-auto">
          <legend className="text-lg font-semibold mb-2 font-display text-primary">Color palette</legend>
          <p className="text-sm text-muted-foreground -mt-4">Pick 3 colors that define this outfit. Sample them from reference art for accuracy.</p>
          {data.colors.map((color, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
              <label htmlFor={`suggest-color-${i}`} className="text-sm font-semibold">
                {COLOR_ROLES[i]}
              </label>
              <div className="flex gap-2">
                <input
                  id={`suggest-color-${i}`}
                  type="color"
                  value={color.hex}
                  onChange={(e) => {
                    const hex = e.target.value;
                    updateColor(i, { hex, name: nearestColorName(hex) });
                  }}
                  className="flex-1 h-12 rounded-lg cursor-pointer border border-border p-0.5 bg-card"
                />
                {data.previewUrl && (
                  <button
                    type="button"
                    onClick={() => setActivePickSlot(i)}
                    className="shrink-0 h-12 px-3 rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors text-xs font-medium flex items-center gap-1.5"
                  >
                    <EyedropperIcon />
                    Pick from Image
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`suggest-color-name-${i}`} className="text-sm font-medium">Color name</label>
                <Input
                  id={`suggest-color-name-${i}`}
                  value={color.name}
                  onChange={(e) => updateColor(i, { name: e.target.value })}
                  placeholder="e.g. Teal"
                  className="bg-white"
                />
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold max-w-lg mx-auto w-full">Review your submission</h2>

          {/* Character page preview — full width to match the real character page */}
          <ReviewStep data={data} />

          <div className="max-w-lg mx-auto w-full flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Your submission will appear after review. You won&apos;t be able to edit it after submitting.</p>
            <ErrorMessage message={submitError} />
            {existingSlug && (
              <p className="text-sm">
                <Link href={`/characters/${existingSlug}`} className="text-primary underline">View the existing page →</Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-8 max-w-lg mx-auto">
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

      {/* Color picker sheet */}
      {activePickSlot !== null && data.previewUrl && (
        <dialog
          ref={pickerDialogRef}
          onCancel={(e) => { e.preventDefault(); setActivePickSlot(null); }}
          onClick={(e) => { if (e.target === e.currentTarget) setActivePickSlot(null); }}
          aria-labelledby="color-picker-title"
          className="fixed inset-0 m-auto flex h-full w-full max-w-none items-end sm:items-center justify-center bg-transparent p-0 sm:p-4 backdrop:bg-black/60"
        >
          <div className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col gap-3 p-4 max-h-[85dvh]">
            <div className="flex items-center justify-between">
              <p id="color-picker-title" className="text-sm font-semibold">
                Pick {COLOR_ROLES[activePickSlot]} color
              </p>
              <button
                type="button"
                onClick={() => setActivePickSlot(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
                aria-label="Close"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground -mt-1">Tap a color on the image to sample it.</p>
            <div className="relative w-fit mx-auto">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasPick}
                onMouseMove={handleCanvasMove}
                onMouseLeave={handleCanvasLeave}
                className="rounded-xl cursor-crosshair block"
                style={{ maxWidth: "100%", maxHeight: "60dvh", width: "auto", height: "auto" }}
              />
              {hoverColor && (
                <div
                  className="pointer-events-none absolute w-8 h-8 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: hoverColor.hex, left: hoverColor.x + 10, top: hoverColor.y + 10 }}
                />
              )}
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

function ReviewStep({ data }: { data: FormData }) {
  const primaryOklch = hexToOklch(data.colors[0].hex);
  const cardColor = `oklch(0.92 ${(primaryOklch.c * 0.35).toFixed(3)} ${primaryOklch.h})`;
  const outfitColors = data.colors.map((c, i) => ({
    name: c.name || COLOR_ROLES[i],
    oklch: hexToOklch(c.hex),
  }));

  return (
    <>
      <div className="text-center">
        <p className="text-2xl font-bold">{data.name}</p>
        <p className="text-muted-foreground mt-1">{data.movie}</p>
        <p className="text-sm text-muted-foreground/70 mt-0.5">{data.outfitName}</p>
      </div>
      <Outfit
        imageSrc={data.previewUrl ?? ""}
        imageAlt={`${data.name} — ${data.outfitName}`}
        cardColor={cardColor}
        colors={outfitColors}
      />
    </>
  );
}

function EyedropperIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 2.5a2.121 2.121 0 013 3L5.5 14 2 14.5 2.5 11 11 2.5z" />
      <path strokeLinecap="round" d="M9 4.5l2.5 2.5" />
    </svg>
  );
}
