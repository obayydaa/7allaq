import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AL 7ALLAG | Premium Barbershop – Amman, Jordan",
  description:
    "Premium grooming experience for the modern gentleman. Precision cuts, beard sculpting, and luxury treatments in Amman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
