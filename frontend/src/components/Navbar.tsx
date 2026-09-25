"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  Map,
  BriefcaseBusiness,
  Network,
  User,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

import StreakWidget from "./StreakWidget";

interface ExploreItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const exploreItems: ExploreItem[] = [
  {
    href: "/careers",
    label: "Careers",
    description: "Explore career paths",
    icon: BriefcaseBusiness,
  },
  {
    href: "/career-map",
    label: "Career Map",
    description: "Visualize your journey",
    icon: Network,
  },
  {
    href: "/jobs",
    label: "Jobs",
    description: "Open roles right now",
    icon: Building2,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isExploreActive = exploreItems.some((item) => isActive(item.href));

  /* Close the dropdown on outside click or Escape */
  useEffect(() => {
    if (!exploreOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!exploreRef.current?.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExploreOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [exploreOpen]);

  return (
    <nav className="sticky top-0 z-50 h-[72px] border-b border-slate-800/80 bg-[#080D18]/95 shadow-[0_4px_25px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="group flex shrink-0 items-center">
          <Image
            src="/images/logo3.png"
            alt="Career Navigator"
            width={210}
            height={85}
            className="h-[65px] sm:h-[75px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            priority
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800/70 bg-[#0B1120]/70 p-1">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`
              group relative flex items-center gap-2 rounded-lg px-4 py-2.5
              text-sm font-medium transition-all duration-200
              ${
                isActive("/dashboard")
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }
            `}
          >
            <LayoutDashboard
              className={`
                h-4 w-4 transition-colors
                ${
                  isActive("/dashboard")
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }
              `}
            />
            Dashboard
            {isActive("/dashboard") && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-blue-400" />
            )}
          </Link>

          {/* Roadmaps */}
          <Link
            href="/roadmaps"
            className={`
              group relative flex items-center gap-2 rounded-lg px-4 py-2.5
              text-sm font-medium transition-all duration-200
              ${
                isActive("/roadmaps")
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }
            `}
          >
            <Map
              className={`
                h-4 w-4 transition-colors
                ${
                  isActive("/roadmaps")
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }
              `}
            />
            Roadmaps
            {isActive("/roadmaps") && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-blue-400" />
            )}
          </Link>

          {/* EXPLORE */}
          <div className="relative" ref={exploreRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={exploreOpen}
              onClick={() => setExploreOpen((value) => !value)}
              className={`
                group flex items-center gap-2 rounded-lg px-4 py-2.5
                text-sm font-medium transition-all duration-200
                ${
                  isExploreActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }
              `}
            >
              <BriefcaseBusiness
                className={`
                  h-4 w-4
                  ${
                    isExploreActive
                      ? "text-blue-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }
                `}
              />
              Explore
              <ChevronDown
                className={`
                  h-3.5 w-3.5 transition-transform duration-200
                  ${exploreOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* Dropdown */}
            {exploreOpen && (
              <div
                role="menu"
                className="
                  absolute left-1/2 top-[calc(100%+10px)]
                  w-60 -translate-x-1/2
                  overflow-hidden rounded-xl
                  border border-slate-800
                  bg-[#0B1120]
                  p-1.5
                  shadow-2xl shadow-black/40
                "
              >
                {exploreItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setExploreOpen(false)}
                      className={`
                        group flex items-center gap-3
                        rounded-lg px-3 py-3
                        transition-all
                        ${index > 0 ? "mt-1" : ""}
                        ${active ? "bg-blue-500/10" : "hover:bg-slate-800/60"}
                      `}
                    >
                      <div
                        className={`
                          flex h-9 w-9 items-center justify-center
                          rounded-lg border
                          ${
                            active
                              ? "border-blue-500/20 bg-blue-500/10"
                              : "border-slate-800 bg-[#060B16]"
                          }
                        `}
                      >
                        <Icon
                          className={`
                            h-4 w-4
                            ${
                              active
                                ? "text-blue-400"
                                : "text-slate-500 group-hover:text-slate-300"
                            }
                          `}
                        />
                      </div>

                      <div>
                        <p
                          className={`
                            text-sm font-medium
                            ${active ? "text-blue-400" : "text-slate-200"}
                          `}
                        >
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="hidden sm:block">
            <StreakWidget />
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-7 w-px bg-slate-800" />

          {/* Profile */}
          <Link
            href="/profile"
            className={`
              group flex items-center gap-2.5
              rounded-xl border px-2 py-1.5
              transition-all duration-200
              ${
                isActive("/profile")
                  ? "border-blue-500/30 bg-blue-500/10"
                  : "border-slate-800 bg-[#0B1120] hover:border-slate-700 hover:bg-[#101827]"
              }
            `}
          >
            <div
              className={`
                flex h-9 w-9 items-center justify-center
                rounded-lg transition-all
                ${
                  isActive("/profile")
                    ? "bg-blue-500/15"
                    : "bg-slate-800 group-hover:bg-slate-700"
                }
              `}
            >
              <User
                className={`
                  h-5 w-5
                  ${isActive("/profile") ? "text-blue-400" : "text-purple-400"}
                `}
              />
            </div>

            <div className="hidden lg:block pr-2">
              <p className="text-xs font-medium text-slate-300">Profile</p>
              <p className="text-[10px] text-slate-600">View account</p>
            </div>
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#0B1120] text-slate-300 hover:text-white transition"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-blue-400" />
            ) : (
              <Menu className="h-5 w-5 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800/90 bg-[#080D18]/98 px-4 py-4 space-y-3 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Navigation Menu
            </span>
            <div className="sm:hidden">
              <StreakWidget />
            </div>
          </div>

          <div className="grid gap-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive("/dashboard")
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-blue-400" />
              Dashboard
            </Link>

            <Link
              href="/roadmaps"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive("/roadmaps")
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              <Map className="h-4 w-4 text-blue-400" />
              Roadmaps
            </Link>

            <div className="pt-2">
              <p className="px-3 pb-1 text-[11px] text-slate-500 font-semibold uppercase">
                Explore
              </p>

              {exploreItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
