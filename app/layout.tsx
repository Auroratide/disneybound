import type { Metadata } from "next";
import { Nunito, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/components/AuthProvider/AuthProvider";
import { SiteHeader } from "@/app/components/SiteHeader/SiteHeader";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Disney Bounding",
  description: "Find color palettes to guide your Disney bounding outfits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${geistMono.variable} ${fredoka.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
