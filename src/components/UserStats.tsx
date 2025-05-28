"use client";

interface Stats {
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
}

export default function UserStats({ userId: _userId }: { userId: string }) {
  // Mock data - в реальном приложении загружаем с API
  // TODO: использовать userId для загрузки реальных данных
  const stats: Stats = {
    totalPredictions: 12,
    correctPredictions: 8,
    currentStreak: 3,
  };

  const accuracy =
    stats.totalPredictions > 0
      ? Math.round((stats.correctPredictions / stats.totalPredictions) * 100)
      : 0;

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-white/10 rounded-lg p-3">
        <div className="text-2xl font-bold">{accuracy}%</div>
        <div className="text-xs text-gray-400">Accuracy</div>
      </div>
      <div className="bg-white/10 rounded-lg p-3">
        <div className="text-2xl font-bold">{stats.totalPredictions}</div>
        <div className="text-xs text-gray-400">Predictions</div>
      </div>
      <div className="bg-white/10 rounded-lg p-3">
        <div className="text-2xl font-bold">🔥{stats.currentStreak}</div>
        <div className="text-xs text-gray-400">Streak</div>
      </div>
    </div>
  );
}
