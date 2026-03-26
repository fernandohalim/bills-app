import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import PlayfulAlert from "@/components/playful-alert";

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "nest — split expenses easily",
  description: "a cozy, offline-first expense splitter for trips with friends.",
  keywords: [
    "splitwise alternative",
    "bill splitter",
    "travel expenses",
    "offline app",
    "nest",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "nest",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdfbf7] text-stone-800">
        <AuthProvider>
          {children}
          <PlayfulAlert /> {/* <-- mount it here right under children */}
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
