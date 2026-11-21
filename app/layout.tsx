import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
