import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "My First Mini App",
  description: "Simple Farcaster mini application",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://farcaster-mini-app-pied.vercel.app/og.png",
    "fc:frame:button:1": "Launch App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://farcaster-mini-app-pied.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
