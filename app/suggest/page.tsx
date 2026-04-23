import type { Metadata } from "next";
import Link from "next/link";
import { getServerAuth } from "@/lib/auth";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";
import { SuggestCharacterForm } from "@/app/components/SuggestCharacterForm/SuggestCharacterForm";
import { LoginButton } from "@/app/components/LoginButton/LoginButton";

export const metadata: Metadata = {
  title: "Suggest a Character — Disney Bounding",
};

export default async function SuggestPage() {
  const { user } = await getServerAuth();

  if (!user) {
    return (
      <main>
        <PageContainer className="py-16 text-center flex flex-col items-center gap-4">
          <p className="text-xl font-semibold">Log in to suggest a character</p>
          <p className="text-muted-foreground text-sm">Use the Log in button in the header to get started.</p>
          <div className="mt-4">
            <LoginButton />
          </div>
          <Link href="/" className="text-sm text-primary hover:underline mt-4">← Back to all characters</Link>
        </PageContainer>
      </main>
    );
  }

  return (
    <main>
      <PageContainer className="pt-4 pb-10">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-6">
          ← All characters
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Suggest a Character</h1>
          <p className="text-muted-foreground mt-2">Know a character we&apos;re missing? Submit them and they&apos;ll appear after review.</p>
        </div>
        <SuggestCharacterForm />
      </PageContainer>
    </main>
  );
}