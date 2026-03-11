import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-heading",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const sarabun = Sarabun({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BVTPA Portal",
  description: "BVTPA TPA Care Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.variable} ${sarabun.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
