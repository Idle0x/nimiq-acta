import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acta — Money moves when reality changes",
  description:
    "Verifiable proof-of-action protocol for Nimiq Pay. Lock NIM for borrowing and bounties, release on proof.",
  appleWebApp: {
    capable: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#0F172A] text-slate-100 overflow-x-hidden overscroll-none">
        <ToastProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-white/5">
            {children}
          </div>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
