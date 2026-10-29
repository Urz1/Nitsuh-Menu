import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PWAInstallProvider } from "@/context/PWAInstallContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-brand",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#C11221",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Nitsuh Cafe & Restaurant | Digital Menu",
  description: "Official interactive digital menu for Nitsuh Cafe & Restaurant. Handcrafted burgers, fresh artisan pizzas, pastries, and barista coffee.",
  manifest: "/manifest.webmanifest",
  applicationName: "Nitsuh Menu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nitsuh Menu",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var m = localStorage.getItem('nitsuh-theme-mode');
                if (m === 'dark') {
                  document.documentElement.setAttribute('data-mode', 'dark');
                  document.documentElement.classList.add('dark');
                } else if (m === 'light') {
                  document.documentElement.setAttribute('data-mode', 'light');
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            `,
          }}
        />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <PWAInstallProvider>{children}</PWAInstallProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('Nitsuh PWA ServiceWorker active:', reg.scope);
                  }).catch(function(err) {
                    console.warn('Nitsuh PWA ServiceWorker registration error:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
