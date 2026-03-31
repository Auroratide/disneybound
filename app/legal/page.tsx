import type { Metadata } from "next";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

export const metadata: Metadata = {
  title: "Legal - Disney Bounding",
  description: "Privacy policy and legal information for Disney Bounding.",
};

export default function LegalPage() {
  return (
    <main>
      <PageContainer className="py-12 max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">Legal</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Privacy Policy</h2>
          <p className="text-foreground/80 leading-relaxed">
            Privacy policy coming soon.
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
