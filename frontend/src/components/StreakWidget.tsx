"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface StreakData {
  streak: {
    count: number;
    lastActiveDate: string | null;
    freezesAvailable: number;
  };
  badges: string[];
}

export default function StreakWidget() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .post(
        "/streak/check",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error("Streak check failed:", err));
  }, []);

  if (!data) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 bg-red-500/10 border border-red-800/40 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
        🔥 {data.streak.count}
      </span>
      {data.streak.freezesAvailable > 0 && (
        <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-800/40 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          🧊 {data.streak.freezesAvailable}
        </span>
      )}
    </div>
  );
}
