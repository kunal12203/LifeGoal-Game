import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers"; // Import the provider we just made
import { Toaster } from "sonner"; // For the RPG notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quest RPG | Level Up Your Life",
  description: "A gamified task tracker for high-performance adventurers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}