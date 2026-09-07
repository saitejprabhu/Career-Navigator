"use client";
import Link from "next/link";
import { useState } from "react";
import StreakWidget from "./StreakWidget";

export default function Navbar() {
  const [exploreOpen, setExploreOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-gray-900">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs">
            CN
          </span>
          <span className="text-white">Career Navigator</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <Link
            href="/dashboard"
            className="hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/career-map"
            className="hover:text-white transition-colors"
          >
            Career Map
          </Link>

          <div className="relative">
            <button
              onClick={() => setExploreOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExploreOpen(false), 150)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Explore
              <span
                className={`text-xs transition-transform ${exploreOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
            {exploreOpen && (
              <div className="absolute top-8 left-0 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1 w-40">
                <Link
                  href="/careers"
                  className="block px-4 py-2 text-sm hover:bg-gray-800"
                >
                  Careers
                </Link>
                <Link
                  href="/career-map"
                  className="block px-4 py-2 text-sm hover:bg-gray-800"
                >
                  Career Map
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StreakWidget />
          <Link
            href="/profile"
            className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-medium hover:ring-2 hover:ring-blue-500 transition"
          >
            👤
          </Link>
        </div>
      </div>
    </nav>
  );
}
