import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import api from "@/lib/api";
import type { SiteSettings } from "@/types";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data } = await api.get("/settings");
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Zylomog";
  const description =
    settings?.metaDescription ||
    "Zylomog — the latest mobile and tech reviews, guides, and industry news.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: `${siteName} — Tech News & Reviews`, template: `%s | ${siteName}` },
    description,
    verification: {
      google: "kVWY98Z2T8eSTSnrZqsasHv85HswYMf-VejnJ0nrAY8",
    },
    openGraph: {
      title: siteName,
      description,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
    },
    icons: settings?.logo?.url ? { icon: settings.logo.url } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar siteName={settings?.siteName} />
            <main className="min-h-[70vh]">{children}</main>
            <Footer
              siteName={settings?.siteName}
              tagline={settings?.tagline}
              socialLinks={settings?.socialLinks}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
