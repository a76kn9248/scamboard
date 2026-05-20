import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
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
