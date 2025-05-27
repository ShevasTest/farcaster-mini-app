import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "My First Mini App",
  description: "Simple Farcaster mini application",
  openGraph: {
    title: "My First Mini App",
    description: "Welcome to your first Farcaster Mini App!",
    images: ["https://farcaster-mini-app-pied.vercel.app/app-icon.png"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://farcaster-mini-app-pied.vercel.app/app-icon.png",
    "fc:frame:button:1": "Open Mini App",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": "https://farcaster-mini-app-pied.vercel.app",
    "of:version": "vNext",
    "of:accepts:xmtp": "2024-02-01",
    "of:image": "https://farcaster-mini-app-pied.vercel.app/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#f3e8ff" }}>
        <Script
          src="https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
