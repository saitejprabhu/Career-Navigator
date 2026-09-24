"use client";

import React, { useState, useEffect } from "react";
import { Banknote, Globe, AlertCircle, RefreshCw, Building2 } from "lucide-react";
import api from "@/lib/api";

interface SalaryInsightsCardProps {
  roleName: string;
}

interface SalaryData {
  available: boolean;
  roleName: string;
  minSalary?: number;
  maxSalary?: number;
  formattedRange?: string;
  currency: string;
  currencySymbol: string;
  region: string;
  dataSource?: string;
  message?: string;
}

const COUNTRIES = [
  { code: "in", name: "India", symbol: "₹", currency: "INR" },
  { code: "us", name: "United States", symbol: "$", currency: "USD" },
  { code: "gb", name: "United Kingdom", symbol: "£", currency: "GBP" },
  { code: "ca", name: "Canada", symbol: "CA$", currency: "CAD" },
  { code: "au", name: "Australia", symbol: "A$", currency: "AUD" },
];

export default function SalaryInsightsCard({ roleName }: SalaryInsightsCardProps) {
  const [country, setCountry] = useState<string>("in");
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSalary = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || !roleName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          `/salary/insights?role=${encodeURIComponent(roleName)}&country=${country}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!cancelled && response.data) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Salary Insights error:", err);
          setError("Unable to load salary data at this time.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSalary();

    return () => {
      cancelled = true;
    };
  }, [roleName, country]);

  const activeCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120] p-5 shadow-xl transition duration-200 hover:border-slate-700 mt-4">
      {/* Background subtle glow */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header & Country selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                💰 Salary Insights
              </h3>
              <p className="text-[11px] text-slate-500">{roleName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#060B16] border border-slate-800 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-medium outline-none cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0B1120] text-white">
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Fetching live salary data...</span>
          </div>
        ) : error ? (
          <div className="my-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : data && data.available ? (
          <div className="my-3 space-y-3">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Estimated Range</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {data.formattedRange}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="rounded-lg border border-slate-800 bg-[#060B16] px-3 py-2">
                <span className="text-slate-500 text-[10px] block">Region</span>
                <span className="font-semibold text-slate-200">{data.region}</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#060B16] px-3 py-2">
                <span className="text-slate-500 text-[10px] block">Currency</span>
                <span className="font-semibold text-slate-200">
                  {data.currency} ({data.currencySymbol})
                </span>
              </div>
            </div>

            {data.dataSource && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>Data Source: <strong className="text-slate-400">{data.dataSource}</strong></span>
              </div>
            )}
          </div>
        ) : (
          <div className="my-3 rounded-lg border border-dashed border-slate-800 bg-[#060B16] p-4 text-center">
            <p className="text-xs text-slate-400">
              Salary information for <span className="text-white font-medium">{roleName}</span> in {activeCountry.name} is currently unavailable.
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Data Source: API</p>
          </div>
        )}
      </div>
    </div>
  );
}
