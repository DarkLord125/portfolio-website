import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Ashwin Nair — Software Engineer",
  description:
    "Explore Ashwin Nair's professional universe: projects, skills and career, as an interactive space journey.",
};

export const viewport: Viewport = {
  themeColor: "#03050b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link type="image/png" sizes="32x32" rel="icon" href="/logo.png" />
      </head>
      <body
        className={`${inter.variable} ${display.variable} ${mono.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}
