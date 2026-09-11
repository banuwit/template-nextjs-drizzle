import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";

const geistHeading = Geist({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: `%s | ${siteConfig.name}`, default: siteConfig.name },
  description: siteConfig.description,
};

// Default tema adalah light (tanpa class `dark`); hanya jalan kalau user
// pernah memilih dark lewat `ThemeToggle`. Inline & sinkron supaya class
// `dark` sudah terpasang sebelum paint pertama — tidak ada flash light→dark.
const themeScript = `
  try {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark")
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `overscroll-y-none` di root scroller (html): tanpa ini, scroll cepat/
    // trackpad memicu rubber-band bounce, dan selama bounce itu browser
    // menghitung ulang posisi sticky per frame — header jadi kelihatan
    // "ikut" bergerak sesaat sebelum settle balik ke top-0.
    <html
      lang="en"
      className={cn("h-full", "overscroll-y-none", "antialiased", geistMono.variable, "font-sans", inter.variable, geistHeading.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/*
        overflow-x-hidden di SINI (bukan di div sidebar-wrapper) supaya
        clipping-nya jadi properti scroller akar lewat "overflow propagation
        to viewport" (spec HTML) — bukan scroll container baru. Kalau ini
        dipasang di elemen non-body, overflow-y otomatis ikut jadi `auto`
        (aturan CSS: satu axis non-visible memaksa axis lain auto), yang
        membuat elemen itu jadi "nearest scroll container" baru, dan header
        sticky di dalamnya jadi nempel ke situ (bukan ke scroll halaman) —
        makanya ikut scroll alih-alih diam di atas.
      */}
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
