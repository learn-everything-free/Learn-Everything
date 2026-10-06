import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { AchievementToaster } from "@/components/achievement-toast";
import { buildSearchIndex } from "@/lib/search-index";
import { buildAchievementIndex } from "@/lib/curriculum-index";
import "./globals.css";

const sans = localFont({
  src: "../fonts/Inter.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
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

// Runs before paint: restores the stored theme, else follows the system.
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("le-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const searchItems = buildSearchIndex();
  const achievementIndex = buildAchievementIndex();
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col bg-eggshell text-ink">
        <Providers>
          <Nav searchItems={searchItems} />
          <main className="flex-1">{children}</main>
          <Footer />
          <AchievementToaster index={achievementIndex} />
        </Providers>
      </body>
    </html>
  );
}
