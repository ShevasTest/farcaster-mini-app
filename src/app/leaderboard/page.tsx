"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import sdk from "@farcaster/frame-sdk";

interface LeaderboardEntry {
  userId: string;
  wins: number;
  total: number;
  accuracy: number;
  streak: number;
}

export default function Leaderboard() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();

        // Mock data - потом заменим на API
        setLeaders([
          { userId: "12345", wins: 23, total: 25, accuracy: 92, streak: 5 },
          { userId: "67890", wins: 18, total: 22, accuracy: 82, streak: 3 },
          { userId: "11111", wins: 15, total: 20, accuracy: 75, streak: 2 },
        ]);

        setIsLoaded(true);
      } catch (error) {
        console.error("SDK init error:", error);
        setIsLoaded(true);
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
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold text-center mb-8">🏆 Leaderboard</h1>

        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <div
              key={leader.userId}
              className="bg-white/10 backdrop-blur p-4 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div>
                    <div className="font-bold">
                      User {leader.userId.slice(0, 8)}
                    </div>
                    <div className="text-sm opacity-70">
                      {leader.wins}/{leader.total} wins • {leader.streak} streak
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{leader.accuracy}%</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
}
