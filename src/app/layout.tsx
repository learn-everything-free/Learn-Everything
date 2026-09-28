import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const sans = localFont({
  src: "../fonts/InstrumentSans.woff2",
  variable: "--font-instrument-sans",
  display: "swap",
});

const mono = localFont({
  src: "../fonts/JetBrainsMono.woff2",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn Everything",
  description:
    "Learn it. Practice it. Break it. Fix it. Build it. A free, hands-on technical learning platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
