"use client";
import Link from "next/link";
import { useState } from "react";
import StreakWidget from "./StreakWidget";
import Image from "next/image";
import { User } from "lucide-react";

export default function Navbar() {
  const [exploreOpen, setExploreOpen] = useState(false);

  return (
    <nav className="h-18 bg-gradient-to-r from-[#050816] via-[#0B1220] to-[#080D18] border-b border-slate-800 shadow-[0_4px_20px_rgba(30,144,255,0.08)]">
      <div className="flex h-full items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span>
            <Image
              src="/images/career-hero.png"
              alt="Career Navigator"
              width={80}
              height={50}
            />
          </span>
        </Link>

        <div className="flex items-center gap-8 text-slate-350 ">
          <Link
            href="/dashboard"
            className="text-base hover:text-white transition"
          >
            Dashboard
          </Link>
          <Link
            href="/career-map"
            className="text-base hover:text-white transition"
          >
            Career Map
          </Link>

          <div className="relative">
            <button
              onClick={() => setExploreOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExploreOpen(false), 150)}
              className=" text-base flex items-center gap-1 hover:text-white transition-colors"
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
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition"
          >
            <User className="w-7 h-7 text-purple-400" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
