import type { Metadata } from "next";
import { Geist, Geist_Mono, Crimson_Text, EB_Garamond, Alegreya, Gentium_Book_Plus, Merriweather, Literata, Lexend, Atkinson_Hyperlegible, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  variable: "--font-crimson",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
});

const gentium = Gentium_Book_Plus({
  weight: ['400', '700'],
  variable: "--font-gentium",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  variable: "--font-merriweather",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  variable: "--font-atkinson",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
};

import { AuthProvider } from "@/components/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${crimsonText.variable} ${ebGaramond.variable} ${alegreya.variable} ${gentium.variable} ${merriweather.variable} ${literata.variable} ${lexend.variable} ${atkinson.variable} ${roboto.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
