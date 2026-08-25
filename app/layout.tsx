import type { Metadata } from "next";
import "./globals.css";
import HUD from "@/components/HUD";

export const metadata: Metadata = {
  title: "VI BUILDS",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <HUD />
        {children}
      </body>
    </html>
  );
}