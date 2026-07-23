import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n/context";
import { getLangFromCookie } from "@/lib/i18n/server";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: {
    default: "Mohasib — FBR digital invoicing for Pakistani businesses & tax consultants",
    template: "%s · Mohasib",
  },
  description:
    "Issue FBR-compliant digital invoices, transmit them to PRAL in real time, and manage every client from one dashboard. Built for Pakistani SMEs and tax consultants. English + اردو.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Mohasib", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1a5c3d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLangFromCookie();
  return (
    <html lang={lang} dir={lang === "ur" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Nastaliq+Urdu:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <PwaRegister />
        <LangProvider initial={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
