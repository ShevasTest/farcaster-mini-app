"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { getTopCoins, CoinPrice } from "@/lib/api";
import Timer from "@/components/Timer";
import UserStats from "@/components/UserStats";
import Image from "next/image";

type Screen = "home" | "select" | "predict" | "result";
type Direction = "up" | "down";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  icon: string;
  image?: string;
  change24h?: number;
}

interface Prediction {
  coin: Coin;
  direction: Direction;
  timestamp: number;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        setUserId(context.user?.fid?.toString() || "anonymous");
        setIsLoaded(true);
      } catch (error) {
        console.error("SDK init error:", error);
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadCoins = async () => {
      setLoading(true);
      const prices = await getTopCoins();
      const formattedCoins = prices.slice(0, 5).map((coin: CoinPrice) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        icon: "🪙",
        image: coin.image,
        change24h: coin.price_change_percentage_24h,
      }));
      setCoins(formattedCoins);
      setLoading(false);
    };

    if (screen === "select") {
      loadCoins();
    }
  }, [screen]);

  const handlePrediction = async (direction: Direction) => {
    if (!selectedCoin) return;

    const newPrediction: Prediction = {
      coin: selectedCoin,
      direction,
      timestamp: Date.now(),
    };

    setPrediction(newPrediction);

    // Save to API
    try {
      await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          coinId: selectedCoin.id,
          coinSymbol: selectedCoin.symbol,
          direction,
          currentPrice: selectedCoin.price,
          predictedPrice:
            selectedCoin.price * (direction === "up" ? 1.05 : 0.95),
        }),
      });
    } catch {
      console.log("Failed to save prediction");
    }

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
          <Timer />
          {userId && userId !== "anonymous" && (
            <div className="mt-6">
              <UserStats userId={userId} />
            </div>
          )}
          <button
            onClick={() => setScreen("select")}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105"
          >
            Start Game
          </button>
          <button
            onClick={() => (window.location.href = "/leaderboard")}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all"
          >
            🏆 Leaderboard
          </button>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">User ID: {userId}</p>
          </div>
        </div>
      )}

      {screen === "select" && (
        <div className="max-w-md mx-auto pt-10">
          <h2 className="text-2xl font-bold text-center mb-8">Select a Coin</h2>
          {loading ? (
            <div className="text-center">
              <div className="animate-pulse text-white">Loading prices...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {coins.map((coin) => (
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
                      {coin.image && (
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={40}
                          height={40}
                          unoptimized
                        />
                      )}
                      <div className="text-left">
                        <div className="font-bold text-xl">{coin.symbol}</div>
                        <div className="text-sm opacity-70">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono">
                        ${coin.price.toLocaleString()}
                      </div>
                      {coin.change24h && (
                        <div
                          className={`text-sm ${
                            coin.change24h > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {coin.change24h > 0 ? "+" : ""}
                          {coin.change24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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
            {selectedCoin.image && (
              <Image
                src={selectedCoin.image}
                alt={selectedCoin.name}
                width={80}
                height={80}
                className="mx-auto mb-4"
                unoptimized
              />
            )}
            <h2 className="text-2xl font-bold mt-4">{selectedCoin.symbol}</h2>
            <div className="text-3xl font-mono mt-2">
              ${selectedCoin.price.toLocaleString()}
            </div>
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
