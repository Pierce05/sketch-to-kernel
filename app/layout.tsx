import type { Metadata, Viewport } from "next";
import { InkBlobProvider } from "@/components/ink-blob-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sketch2Kernel — Hand-Drawn Napkin Sketches into Tailwind Components",
  description:
    "Turn hand-drawn napkin wireframes into pure Tailwind CSS components in seconds using Google Gemma 4, NVIDIA NIM, and Custom Endpoints. Built like an interactive digital sketchbook with Rough.js and live sandbox execution.",
  keywords: [
    "Sketch2Kernel",
    "Sketch to Kernel",
    "Gemma 4",
    "NVIDIA NIM",
    "Rough.js",
    "Tailwind CSS",
    "Hacktoberfest 2026",
    "Wireframe to Code",
    "Canvas",
  ],
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f6f5f0] text-[#18181b] antialiased selection:bg-[#fef08a] selection:text-[#18181b]">
        <InkBlobProvider>{children}</InkBlobProvider>
      </body>
    </html>
  );
}
