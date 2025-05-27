"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

type Screen = "home" | "game" | "result";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        setIsLoaded(true);
      } catch (error) {
        console.error("SDK init error:", error);
      }
    };
    init();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4">
      {screen === "home" && (
        <div className="max-w-md mx-auto pt-20">
          <h1 className="text-5xl font-bold text-center mb-4">🎯</h1>
          <h2 className="text-3xl font-bold text-center mb-8">
            Guess the Price
          </h2>
          <button
            onClick={() => setScreen("game")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}
