"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

type Screen = "home" | "select" | "predict" | "result";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

const COINS: Coin[] = [
  { id: "btc", symbol: "BTC", name: "Bitcoin", price: 45230, icon: "₿" },
  { id: "eth", symbol: "ETH", name: "Ethereum", price: 2890, icon: "Ξ" },
  { id: "sol", symbol: "SOL", name: "Solana", price: 98.45, icon: "◎" },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

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
            onClick={() => setScreen("select")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      )}

      {screen === "select" && (
        <div className="max-w-md mx-auto pt-10">
          <h2 className="text-2xl font-bold text-center mb-8">Select a Coin</h2>
          <div className="space-y-4">
            {COINS.map((coin) => (
              <button
                key={coin.id}
                onClick={() => {
                  setSelectedCoin(coin);
                  setScreen("predict");
                }}
                className="w-full bg-white/10 backdrop-blur hover:bg-white/20 p-6 rounded-2xl transition-all transform hover:scale-102"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{coin.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-xl">{coin.symbol}</div>
                      <div className="text-sm opacity-70">{coin.name}</div>
                    </div>
                  </div>
                  <div className="text-xl font-mono">${coin.price}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === "predict" && selectedCoin && (
        <div className="max-w-md mx-auto pt-10">
          <div className="text-center mb-8">
            <span className="text-6xl">{selectedCoin.icon}</span>
            <h2 className="text-2xl font-bold mt-4">{selectedCoin.symbol}</h2>
            <div className="text-3xl font-mono mt-2">${selectedCoin.price}</div>
          </div>
          <p className="text-center text-xl mb-8">In 24 hours, will it go...</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-600 hover:bg-green-700 p-8 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105">
              📈 UP
            </button>
            <button className="bg-red-600 hover:bg-red-700 p-8 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105">
              📉 DOWN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
