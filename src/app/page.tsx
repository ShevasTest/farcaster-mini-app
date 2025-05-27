"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    sdk?: {
      actions: {
        ready: () => void;
      };
    };
  }
}

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.sdk) {
      window.sdk.actions.ready();
    }
  }, []);

  return (
    <div className="min-h-screen bg-purple-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-800">
          🚀 My First Mini App
        </h1>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Welcome to your first Farcaster Mini App!
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700">✅ Mini App is working!</p>
            <p className="text-xs text-gray-500 mt-2">
              Share this app in Farcaster to test
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
