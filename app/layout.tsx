import type { Metadata } from "next";
import { JetBrains_Mono, Rubik } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "SCAMBOARD - Community Memecoin Scammer Watchlist",
  description:
    "The community-powered wall of shame for memecoin scammers. Report deployer addresses and Twitter handles, verify with the community, and protect degens everywhere.",
  keywords: ["scam", "crypto", "memecoin", "rugpull", "blockchain", "watchlist", "scammer"],
  openGraph: {
    title: "SCAMBOARD - Community Memecoin Scammer Watchlist",
    description: "The community-powered wall of shame for memecoin scammers.",
    type: "website",
    siteName: "SCAMBOARD",
  },
  twitter: {
    card: "summary_large_image",
    title: "SCAMBOARD - Community Memecoin Scammer Watchlist",
    description: "The community-powered wall of shame for memecoin scammers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${rubik.variable} antialiased`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-mono flex flex-col">
        <Providers>
          {/* Grain overlay */}
          <div className="grain-overlay" aria-hidden="true" />

          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
