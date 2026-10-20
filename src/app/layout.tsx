import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { AppShell } from "@/core/ui/AppShell";
import { ToastProvider } from "@/core/ui/Toast";
import { RegisterServiceWorker } from "@/core/pwa/RegisterServiceWorker";
import { themeScript } from "@/core/theme/theme";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Kitty Glitter", template: "%s · Kitty Glitter" },
  description: "A calm personal life hub. Demo with fictional data.",
  applicationName: "Kitty Glitter",
  appleWebApp: { capable: true, title: "Kitty Glitter", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a19" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
