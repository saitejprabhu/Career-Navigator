"use client";
import { useEffect, useState, useRef } from "react";
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
  const [showTooltip, setShowTooltip] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  if (!data) return null;

  const count = data.streak.count;
  const freezes = data.streak.freezesAvailable;

  return (
    <div className="relative" ref={widgetRef}>
      <button
        type="button"
        onClick={() => setShowTooltip((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-[#0B1120] px-3 py-1.5 transition-all hover:border-blue-500/50 hover:bg-[#101827] cursor-pointer"
        title="Streak & Freeze Status"
      >
        {/* Streak Count */}
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-amber-300">
            {count} {count === 1 ? "day" : "days"}
          </span>
        </div>

        {/* Freezes */}
        {freezes > 0 && (
          <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2 text-cyan-400">
            <Snowflake className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{freezes}</span>
          </div>
        )}
      </button>

      {/* Interactive Tooltip Popover */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-800 bg-[#0B1120] p-4 shadow-2xl z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Daily Streak</h4>
            </div>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
              Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#060B16] p-2.5">
              <span className="text-slate-400">Current Streak</span>
              <span className="font-bold text-amber-400">{count} Days 🔥</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#060B16] p-2.5">
              <div className="flex items-center gap-1.5">
                <Snowflake className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-400">Streak Freezes</span>
              </div>
              <span className="font-bold text-cyan-400">{freezes} Available ❄️</span>
            </div>

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-[11px] text-slate-300 leading-relaxed">
              💡 <strong>Streak Freeze Rule:</strong> You earn 1 freeze after every 3 continuous active days! If you miss a day, 1 freeze is automatically used to protect your streak.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
