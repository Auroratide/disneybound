import Link from "next/link";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border py-8 text-sm text-muted-foreground bg-background">
      <PageContainer className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p>
          Made by{" "}
          <a
            href="https://auroratide.com"
            className="underline hover:text-foreground transition-colors"
          >
            Auroratide
          </a>{" "}
          for their Mom
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </li>
            {/* <li>
              <a
                href="https://github.com/auroratide/disneybound"
                className="hover:text-foreground transition-colors"
              >
                Website Code
              </a>
            </li> */}
          </ul>
        </nav>
      </PageContainer>
    </footer>
  );
}
