"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Zap, Snowflake } from "lucide-react";

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
      {/* Streak */}
      <div className="w-18 h-10 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center gap-1">
        <Zap className="w-6 h-6 text-blue-400 fill-blue-400" />
        <span className="text-10px font-semibold text-blue-400">
          {data.streak.count}
        </span>
      </div>

      {/* Freezes */}
      {data.streak.freezesAvailable > 0 && (
        <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-800/40 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          <Snowflake className="w-3.5 h-3.5" />
          {data.streak.freezesAvailable}
        </span>
      )}
    </div>
  );
}
