"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

type Screen = "home" | "select" | "predict" | "result";
type Direction = "up" | "down";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

interface Prediction {
  coin: Coin;
  direction: Direction;
  timestamp: number;
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
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        const context = await sdk.context.get();
        setUserId(context.user?.fid?.toString() || "anonymous");
        setIsLoaded(true);
      } catch (error) {
        console.error("SDK init error:", error);
      }
    };
    init();
  }, []);

  const handlePrediction = async (direction: Direction) => {
    if (!selectedCoin) return;

    const newPrediction: Prediction = {
      coin: selectedCoin,
      direction,
      timestamp: Date.now(),
    };

    setPrediction(newPrediction);

    // Show notification
    await sdk.actions.notify({
      title: "Prediction Submitted! 🎯",
      body: `You predicted ${
        selectedCoin.symbol
      } will go ${direction.toUpperCase()}`,
      type: "success",
    });

    // Save to localStorage (in real app would be database)
    const predictions = JSON.parse(localStorage.getItem("predictions") || "[]");
    predictions.push({ ...newPrediction, userId });
    localStorage.setItem("predictions", JSON.stringify(predictions));

    setScreen("result");
  };

  const resetGame = () => {
    setSelectedCoin(null);
    setPrediction(null);
    setScreen("home");
  };

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
          <p className="text-center text-gray-300 mb-8">
            Predict if crypto prices will go up or down in 24 hours!
          </p>
          <button
            onClick={() => setScreen("select")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105"
          >
            Start Game
          </button>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">User ID: {userId}</p>
          </div>
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
          <button
            onClick={() => setScreen("home")}
            className="w-full mt-6 text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
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
            <button
              onClick={() => handlePrediction("up")}
              className="bg-green-600 hover:bg-green-700 p-8 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105"
            >
              📈 UP
            </button>
            <button
              onClick={() => handlePrediction("down")}
              className="bg-red-600 hover:bg-red-700 p-8 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105"
            >
              📉 DOWN
            </button>
          </div>
          <button
            onClick={() => setScreen("select")}
            className="w-full mt-6 text-gray-400 hover:text-white transition-colors"
          >
            ← Change coin
          </button>
        </div>
      )}

      {screen === "result" && prediction && (
        <div className="max-w-md mx-auto pt-20 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold mb-4">Prediction Submitted!</h2>
          <div className="bg-white/10 backdrop-blur p-6 rounded-2xl mb-8">
            <div className="text-5xl mb-4">{prediction.coin.icon}</div>
            <p className="text-xl mb-2">
              You predicted{" "}
              <span className="font-bold">{prediction.coin.symbol}</span> will
              go
            </p>
            <p
              className={`text-3xl font-bold ${
                prediction.direction === "up"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {prediction.direction === "up" ? "📈 UP" : "📉 DOWN"}
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Check back in 24 hours to see if you were right!
            </p>
          </div>
          <button
            onClick={resetGame}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all transform hover:scale-105"
          >
            Make Another Prediction
          </button>
        </div>
      )}
    </div>
  );
}
