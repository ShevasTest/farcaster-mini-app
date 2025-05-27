import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My First Mini App",
  description: "Simple Farcaster mini application",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://farcaster-mini-app-pied.vercel.app/api/og",
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
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
