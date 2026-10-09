import type { Metadata, Viewport } from "next";
import { InkBlobProvider } from "@/components/ink-blob-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "SketchToKernel — Turn Hand-Drawn Sketches into Tailwind Components",
  description:
    "AI-powered developer workbench powered by Gemma 4 31B. Sketch on canvas or drop a photo to generate clean sandboxed Tailwind components with live prop controls.",
  keywords: ["Tailwind CSS", "Gemma 4", "AI Code Generation", "Hacktoberfest 2026", "Wireframe to Code", "Canvas"],
};

export const viewport: Viewport = {
  themeColor: "#090a0f",
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <InkBlobProvider>{children}</InkBlobProvider>
      </body>
    </html>
  );
}
