import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFXtract - Scanned PDF OCR & Text Extraction Tool",
  description:
    "Process scanned PDF documents with high-precision OCR. Convert each page to JPEG, then use advanced AI to extract and output text content in Markdown format, preserving original layout and formatting.",
  keywords:
    "PDF OCR, scanned PDF, text extraction, PDF to JPG, PDF to Markdown, AI OCR, Gemini AI, layout preservation, document digitization",
  authors: [{ name: "PDFXtract Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfxtract.blazorserver.com/",
    title: "PDFXtract - Scanned PDF OCR & Text Extraction Tool",
    description:
      "Process scanned PDFs with AI-powered OCR. Convert pages to images and extract text as Markdown, preserving layout.",
    siteName: "PDFXtract",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFXtract - Scanned PDF OCR & Text Extraction Tool",
    description:
      "Process scanned PDFs with AI-powered OCR. Convert pages to images and extract text as Markdown, preserving layout.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-4 md:pt-6">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
