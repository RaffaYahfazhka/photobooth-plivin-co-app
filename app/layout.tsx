import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Manrope, Krona_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const kronaOne = Krona_One({
  weight: "400",
  variable: "--font-krona-one",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plivin.co - Financial Tracker",
  description: "Atur keuanganmu makin santuy!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Plivin",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${kronaOne.variable} antialiased`}
      >
        <ServiceWorkerRegistrar />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

