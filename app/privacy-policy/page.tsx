import type { Metadata } from "next";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

export const metadata: Metadata = {
  title: "Legal - Disney Bounding",
  description: "Privacy policy and legal information for Disney Bounding.",
};

export default function LegalPage() {
  return (
    <main>
      <PageContainer className="py-12 max-w-xl">
        <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>

        <section className="mb-8">
          <p className="text-foreground/80 leading-relaxed">
            <strong>Effective Date:</strong> 25 April 2026
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Disney Bounding Catalog ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of information when you visit our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
          <p className="text-foreground/80 leading-relaxed">
            We collect your email address when you create an account or sign in. This information is used solely for authentication and account access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="text-foreground/80 leading-relaxed">
            We use your email address only to:
          </p>
          <ul className="list-disc pl-6 mb-3 space-y-1 text-foreground/80 leading-relaxed">
            <li>Allow you to sign in to your account.</li>
            <li>Communicate essential account-related information (if applicable).</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            We do not use your email for marketing or share it with third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Information We Do Not Collect</h2>
          <ul className="list-disc pl-6 mb-3 space-y-1 text-foreground/80 leading-relaxed">
            <li>We do not collect any additional personal data beyond your email address.</li>
            <li>We do not collect names, addresses, or payment information.</li>
            <li>We do not use cookies or tracking technologies.</li>
            <li>We do not log information about your visit, such as IP addresses, browser details, or browsing history.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            We do not use your email for marketing or share it with third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Application Data</h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            Our application stores data related to user activity or configuration (referred to as ‘application data’). This data is stored securely on our servers and identified through your account email address.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-3">
            Your data, including shared photos, are not shared with any third parties. You have the right and ability to delete your data at any time.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-3">
            We take reasonable precautions to protect the data stored on our servers, including encryption and access control.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Account Deletion</h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            You may request deletion of your account, associated email, and application data at any time.
          </p>
          <p className="text-foreground/80 leading-relaxed">Contact us at <a href="mailto:contact@auroratide.com">contact@auroratide.com</a> for any requests or concerns.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Changes To This Policy</h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            We may update this Privacy Policy from time to time. Any changes will be reflected on this page with the updated effective date.
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
