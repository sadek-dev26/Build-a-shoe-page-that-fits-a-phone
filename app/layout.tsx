import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font downloads Inter at build time and serves it from this site, so
// there is no extra trip to Google on a slow phone. It also makes a fallback
// font (Arial, resized with size-adjust and ascent/descent overrides) that
// takes the same space as Inter, so text doesn't grow or wrap when Inter
// arrives. Only the Latin letters are sent.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nike Pegasus 43",
  description: "Nike Pegasus 43 in Black/White-Volt",
};

// The page is laid out to fit a 375 px phone without zooming or sideways
// scrolling. Zoom stays allowed so people who need larger text can pinch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
