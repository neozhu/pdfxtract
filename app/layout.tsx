import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFXtract - PDF Processing & Conversion Tool",
  description: "Converts PDF files to JPG images, bundles them as a ZIP, performs AI-powered OCR via Gemini 2.5 (ai-sdk) to extract text while preserving original layout, and merges everything into a language-selectable Markdown file for download.",
  keywords: "PDF converter, OCR, text extraction, PDF to JPG, PDF to Markdown, Gemini AI",
  authors: [{ name: "PDFXtract Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfxtract.blazorserver.com/",
    title: "PDFXtract - PDF Processing & Conversion Tool",
    description: "Convert PDFs to various formats with AI-powered text extraction and layout preservation",
    siteName: "PDFXtract",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFXtract - PDF Processing & Conversion Tool",
    description: "Convert PDFs to various formats with AI-powered text extraction and layout preservation",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-4 md:pt-6">
            {children}
          </main>
          <Footer />
        </div>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
