'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/*
  SQL for Supabase RPC function `get_leaderboard_data`:

  CREATE OR REPLACE FUNCTION get_leaderboard_data()
  RETURNS TABLE(user_id TEXT, score BIGINT, total_predictions BIGINT)
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      p.user_id,
      SUM(CASE WHEN p.status = 'correct' THEN 1 ELSE 0 END)::BIGINT AS score,
      COUNT(CASE WHEN p.status = 'correct' OR p.status = 'incorrect' THEN 1 ELSE NULL END)::BIGINT AS total_predictions
    FROM
      "Predictions" p
    WHERE
      p.status = 'correct' OR p.status = 'incorrect' -- Only consider resolved predictions
    GROUP BY
      p.user_id
    HAVING
      COUNT(CASE WHEN p.status = 'correct' OR p.status = 'incorrect' THEN 1 ELSE NULL END)::BIGINT > 0 -- Only users with resolved predictions
    ORDER BY
      score DESC,
      total_predictions DESC; -- Secondary sort by total predictions
  END;
  $$ LANGUAGE plpgsql;
*/

interface LeaderboardEntry {
  user_id: string;
  score: number;
  total_predictions: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch leaderboard: ${response.statusText}`);
        }
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Consistent button styles from page.tsx (example, define centrally if used more)
  const baseButtonClass = "w-full font-bold py-3 px-6 rounded-xl text-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed";
  const primaryButtonClass = `${baseButtonClass} bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-400 hover:scale-105`;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4 flex flex-col items-center selection:bg-purple-500 selection:text-white">
      <header className="py-10 text-center w-full max-w-3xl">
        <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400">
          🏆 Leaderboard 🏆
        </h1>
        <p className="text-lg text-purple-300 mt-3">See who's mastering the market predictions!</p>
      </header>

      <main className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-purple-700/30">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-5 text-xl text-purple-300">Loading Leaderboard...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10 bg-red-800/40 backdrop-blur-sm p-6 rounded-lg border border-red-600">
            <p className="text-3xl text-red-300 mb-3">⚠️</p>
            <p className="text-xl text-red-300 mb-2">Error Loading Leaderboard</p>
            <p className="text-sm text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && leaderboardData.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-4xl text-purple-300 mb-4">📊</p>
            <p className="text-2xl text-purple-300">The Leaderboard is Empty</p>
            <p className="text-md text-gray-400 mt-2">Be the first to make a prediction and claim the top spot!</p>
          </div>
        )}

        {!isLoading && !error && leaderboardData.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-purple-700/30 shadow-md">
            <table className="min-w-full divide-y divide-purple-700/50">
              <thead className="bg-purple-600/30">
                <tr>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">User (FID)</th>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">Total Predictions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-800/60 bg-black/20">
                {leaderboardData.map((entry, index) => (
                  <tr key={entry.user_id} className="hover:bg-purple-500/25 transition-colors duration-150 group">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                      <span className={`
                        ${index < 3 ? 'text-2xl' : 'text-purple-200'}
                        ${index === 0 ? 'text-yellow-400 group-hover:text-yellow-300' : ''}
                        ${index === 1 ? 'text-slate-300 group-hover:text-slate-200' : ''}
                        ${index === 2 ? 'text-orange-400 group-hover:text-orange-300' : ''}
                      `}>
                        {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <a
                        href={`https://warpcast.com/fid/${entry.user_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-300 hover:text-indigo-200 hover:underline transition-colors duration-150 font-medium"
                      >
                        {entry.user_id}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-lg text-purple-100 font-bold">{entry.score}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-purple-300">{entry.total_predictions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/" legacyBehavior>
            <a className={primaryButtonClass.replace('w-full', 'inline-block px-8')}>
              ← Back to Game
            </a>
          </Link>
        </div>
      </main>

      <footer className="text-center py-10 mt-auto text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} Crypto Price Predictor. All rights reserved.</p>
      </footer>
    </div>
  );
}
