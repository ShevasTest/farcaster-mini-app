"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'; 
import sdk from "@farcaster/frame-sdk";
import { getCoinMarketData } from "@/lib/api"; 
import Timer from "@/components/Timer"; // Timer.tsx styling was already good.

type Screen = "home" | "select" | "predict" | "result";
type Direction = "up" | "down";

interface ManagedCoin {
  id: string; 
  coin_id: string; 
  symbol: string;
  name: string;
  image_url: string | null; 
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DisplayCoin {
  id: string; 
  db_id: string; 
  symbol: string;
  name: string;
  price: number;
  image_url: string | null; 
  change24h?: number;
}

interface Prediction {
  coin: DisplayCoin;
  direction: Direction;
  timestamp: number; 
  db_id?: string; 
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCoin, setSelectedCoin] = useState<DisplayCoin | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [coins, setCoins] = useState<DisplayCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const context = await sdk.getFrameContext();
        if (context?.message?.user?.fid) {
            setUserId(context.message.user.fid.toString());
        } else {
            const localUserId = localStorage.getItem('farcaster_fid');
            if (localUserId) {
                setUserId(localUserId);
            } else {
                const mockFid = `mock_fid_${Math.floor(Math.random() * 10000)}`;
                localStorage.setItem('farcaster_fid', mockFid);
                setUserId(mockFid);
                console.warn(`No Farcaster FID found, using mock FID: ${mockFid}. For production, ensure app is in a Farcaster frame.`);
            }
        }
        setIsLoaded(true);
      } catch (err) {
        console.error("SDK init error:", err);
        const localUserId = localStorage.getItem('farcaster_fid');
        if (localUserId) {
            setUserId(localUserId);
        } else {
            const mockFid = `mock_fid_${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem('farcaster_fid', mockFid);
            setUserId(mockFid);
            console.warn(`SDK init failed, using mock FID: ${mockFid}. This is common outside a Farcaster frame.`);
        }
        setIsLoaded(true); 
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadCoins = async () => {
      setLoading(true);
      setError(null);
      setCoins([]); 
      try {
        const response = await fetch('/api/managed-coins');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch managed coins: ${response.statusText}`);
        }
        const managedCoins: ManagedCoin[] = await response.json();

        if (!managedCoins || managedCoins.length === 0) {
          setLoading(false);
          return;
        }

        const coinsWithMarketDataPromises = managedCoins
          .filter(mc => mc.is_active) 
          .map(async (managedCoin) => {
            const marketData = await getCoinMarketData(managedCoin.coin_id);
            if (marketData) {
              return {
                id: managedCoin.coin_id,
                db_id: managedCoin.id,
                symbol: managedCoin.symbol.toUpperCase(),
                name: managedCoin.name,
                price: marketData.current_price,
                image_url: managedCoin.image_url,
                change24h: marketData.price_change_percentage_24h,
              };
            } else {
              console.warn(`Could not fetch market data for ${managedCoin.name} (${managedCoin.coin_id})`);
              return null; 
            }
          });
        
        const resolvedCoins = (await Promise.all(coinsWithMarketDataPromises)).filter(Boolean) as DisplayCoin[];
        setCoins(resolvedCoins);

      } catch (err) {
        console.error("Error loading coins:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while loading coins.");
      } finally {
        setLoading(false);
      }
    };

    if (screen === "select") {
      loadCoins();
    }
  }, [screen]);

  const handlePrediction = async (direction: Direction) => {
    if (!selectedCoin || !userId) {
        setError("Selected coin or user ID is missing.");
        return;
    }
    if (selectedCoin.price <= 0) {
        setError(`Price data for ${selectedCoin.name} is unavailable. Cannot make prediction.`);
        return;
    }

    const newPredictionPayload = {
        userId: userId,
        coinId: selectedCoin.id, 
        predictedDirection: direction,
        actualPriceAtPrediction: selectedCoin.price,
    };

    try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPredictionPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Prediction API error: ${response.statusText}`);
        }
        const savedPredictionApiResult = await response.json(); 
        
        setPrediction({
            coin: selectedCoin,
            direction,
            timestamp: new Date(savedPredictionApiResult.prediction_timestamp).getTime(),
            db_id: savedPredictionApiResult.id 
        });
        setScreen("result");

    } catch (err) {
        console.error("Error submitting prediction:", err);
        setError(err instanceof Error ? err.message : "Failed to submit prediction.");
    } finally {
        setLoading(false);
    }
  };

  const resetGame = () => {
    setSelectedCoin(null);
    setPrediction(null);
    setError(null);
    setScreen("home");
  };

  if (!isLoaded && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center p-4">
        <div className="animate-pulse text-white text-xl">Initializing Farcaster Connection...</div>
      </div>
    );
  }

  // Base button style
  const baseButtonClass = "w-full font-bold py-3 px-6 rounded-xl text-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed";
  const primaryButtonClass = `${baseButtonClass} bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-400 hover:scale-105`;
  const secondaryButtonClass = `${baseButtonClass} bg-white/10 hover:bg-white/20 text-white focus:ring-purple-500`;
  const backButtonClass = "w-full mt-8 text-gray-400 hover:text-purple-300 transition-colors py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400";


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4 flex flex-col items-center selection:bg-purple-500 selection:text-white">
      {error && (
        <div className="fixed top-4 right-4 max-w-sm bg-red-700/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl z-50 break-words border border-red-500">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Error!</span>
            <button onClick={() => setError(null)} className="ml-2 text-xl hover:text-red-200 transition-colors">&times;</button>
          </div>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Screen Content Area */}
      <div className="w-full max-w-md flex-grow flex flex-col justify-center">

        {screen === "home" && (
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">🎯</h1>
            <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400">
              Price Predictor
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Guess if prices go up or down in 24 hours!
            </p>
            <div className="my-8">
              <Timer />
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setScreen("select")}
                disabled={loading}
                className={primaryButtonClass}
              >
                {loading ? "Loading..." : "🚀 Start Game"}
              </button>
              <Link href="/leaderboard" legacyBehavior>
                <a className={`${secondaryButtonClass} block text-center`}>
                  🏆 Leaderboard
                </a>
              </Link>
            </div>
            <div className="mt-10 text-center">
              <p className="text-xs text-gray-500">User FID: {userId || "Initializing..."}</p>
            </div>
          </div>
        )}

        {screen === "select" && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Select a Coin</h2>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="mt-4 text-purple-300">Loading coins...</p>
              </div>
            ) : coins.length === 0 && !error ? (
              <div className="text-center py-10 px-4 bg-white/5 rounded-xl">
                  <p className="text-xl text-purple-300 mb-2">No coins available for prediction.</p>
                  <p className="text-sm text-gray-400">Please check back later or contact an admin.</p>
              </div>
            ): (
              <div className="space-y-3">
                {coins.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => {
                      setSelectedCoin(coin);
                      setScreen("predict");
                    }}
                    disabled={coin.price <= 0} 
                    className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 p-4 rounded-xl transition-all transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {coin.image_url ? (
                          <img
                            src={coin.image_url}
                            alt={coin.name}
                            className="w-10 h-10 rounded-full object-cover shadow-md"
                          />
                        ) : (
                          <span className="text-3xl leading-none">🪙</span>
                        )}
                        <div className="text-left">
                          <div className="font-bold text-lg">{coin.symbol}</div>
                          <div className="text-xs opacity-70">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-mono">
                          {coin.price > 0 ? `$${coin.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: coin.price < 1 ? 5 : 2})}` : 'Price N/A'}
                        </div>
                        {coin.change24h !== undefined && coin.price > 0 && (
                          <div
                            className={`text-xs font-semibold ${
                              (coin.change24h || 0) >= 0 
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {(coin.change24h || 0) >= 0 ? "▲" : "▼"}
                            {(coin.change24h || 0).toFixed(2)}%
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
              className={backButtonClass}
            >
              ← Back to Home
            </button>
          </div>
        )}

        {screen === "predict" && selectedCoin && (
          <div className="text-center">
            <div className="mb-6">
              {selectedCoin.image_url ? (
                <img
                  src={selectedCoin.image_url}
                  alt={selectedCoin.name}
                  className="w-24 h-24 mx-auto mb-3 rounded-full object-cover shadow-xl border-2 border-purple-500/50"
                />
              ) : (
                  <span className="text-6xl leading-none mx-auto mb-3">🪙</span>
              )}
              <h2 className="text-3xl font-bold">{selectedCoin.symbol}</h2>
              <p className="text-sm text-gray-400">{selectedCoin.name}</p>
              <div className="text-4xl font-mono mt-2 mb-6">
                ${selectedCoin.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: selectedCoin.price < 1 ? 5 : 2})}
              </div>
            </div>
            <p className="text-xl mb-6">In 24 hours, will {selectedCoin.name} go...</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePrediction("up")}
                disabled={loading}
                className={`${baseButtonClass} bg-green-500 hover:bg-green-600 text-white focus:ring-green-400 text-xl md:text-2xl py-6 hover:scale-105`}
              >
                {loading ? "..." : "📈 UP"}
              </button>
              <button
                onClick={() => handlePrediction("down")}
                disabled={loading}
                className={`${baseButtonClass} bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 text-xl md:text-2xl py-6 hover:scale-105`}
              >
                {loading ? "..." : "📉 DOWN"}
              </button>
            </div>
            <button
              onClick={() => setScreen("select")}
              className={backButtonClass}
            >
              ← Change Coin
            </button>
          </div>
        )}

        {screen === "result" && prediction && (
          <div className="text-center">
            <div className="text-7xl mb-4 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold mb-3">Prediction Submitted!</h2>
            
            {prediction.db_id && (
              <p className="text-xs text-purple-400 mb-4">Prediction ID: {prediction.db_id}</p>
            )}

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-6 shadow-lg">
              {prediction.coin.image_url ? (
                   <img
                      src={prediction.coin.image_url}
                      alt={prediction.coin.name}
                      className="w-16 h-16 mx-auto mb-3 rounded-full object-cover border border-purple-500/30"
                  />
              ) : (
                  <div className="text-5xl leading-none mb-3">🪙</div>
              )}
              <p className="text-lg mb-1">
                You predicted{" "}
                <span className="font-bold text-purple-300">{prediction.coin.symbol}</span> will go
              </p>
              <p
                className={`text-4xl font-bold mb-3 ${
                  prediction.direction === "up"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {prediction.direction === "up" ? "📈 UP" : "📉 DOWN"}
              </p>
              <p className="text-xs text-gray-400">
                Price at prediction: ${prediction.coin.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: prediction.coin.price < 1 ? 5 : 2})}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Check the leaderboard later to see your rank!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                  onClick={resetGame}
                  className={primaryButtonClass}
              >
                  Make Another Prediction
              </button>
              <Link href="/leaderboard" legacyBehavior>
                  <a className={`${secondaryButtonClass} block text-center`}>
                    🏆 View Leaderboard
                  </a>
              </Link>
            </div>
          </div>
        )}
      </div> {/* End Screen Content Area */}
    </div>
  );
}
