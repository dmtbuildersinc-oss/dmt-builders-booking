import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${siteConfig.company.name} | Schedule Your Consultation`,
  description: siteConfig.company.tagline,
};

// Colors are injected as CSS variables from config/site.ts so the entire
// palette can be changed in one place without touching component code.
const themeStyle = {
  "--color-navy": siteConfig.colors.navy,
  "--color-gold": siteConfig.colors.gold,
  "--color-warm-white": siteConfig.colors.warmWhite,
  "--color-soft-gray": siteConfig.colors.gray,
  "--color-ink": siteConfig.colors.text,
} as React.CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
      style={themeStyle}
    >
      <body className="min-h-full flex flex-col bg-warm-white text-ink font-body">
        {children}
      </body>
    </html>
  );
}
