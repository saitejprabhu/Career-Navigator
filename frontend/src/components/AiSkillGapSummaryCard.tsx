"use client";

import React, { useState } from "react";
import { Bot, Sparkles, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import api from "@/lib/api";

interface AiSkillGapSummaryCardProps {
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  projects?: string[];
  experience?: string;
}

export default function AiSkillGapSummaryCard({
  targetRole,
  currentSkills,
  missingSkills,
  projects = [],
  experience,
}: AiSkillGapSummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [customDoubt, setCustomDoubt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const generateSummary = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Please log in to generate an AI summary.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        "/ai/skill-gap-summary",
        {
          targetRole,
          currentSkills,
          missingSkills,
          projects,
          experience,
          customDoubt: customDoubt.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.summary) {
        setSummary(response.data.summary);
        setSource(response.data.source || null);
      } else {
        setError("Unable to generate summary at this time.");
      }
    } catch (err: any) {
      console.error("AI Skill Gap Summary error:", err);
      setError(
        err.response?.data?.message || "Failed to fetch AI Skill Gap Summary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120] p-6 shadow-xl transition-all duration-200 hover:border-slate-700">
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                🤖 AI Skill Gap Summary
              </h3>
              <p className="text-xs text-slate-500">
                Personalized AI insights for {targetRole || "your target role"}
              </p>
            </div>
          </div>
          {source && (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-400">
              {source}
            </span>
          )}
        </div>

        {/* Content Body */}
        {summary ? (
          <div className="my-4 rounded-xl border border-blue-500/20 bg-[#060B16] p-4 text-sm leading-relaxed text-slate-300">
            <p>{summary}</p>
          </div>
        ) : (
          <div className="my-4 rounded-xl border border-dashed border-slate-800 bg-[#060B16] p-5 text-center">
            <p className="text-xs text-slate-400">
              Click the button below to generate a tailored AI breakdown of your current skills and missing requirements for <span className="font-semibold text-white">{targetRole}</span>.
            </p>
          </div>
        )}

        {/* Optional Custom Doubt / Question Input */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            <span>Have a specific question or doubt? (Optional)</span>
          </label>
          <input
            type="text"
            value={customDoubt}
            onChange={(e) => setCustomDoubt(e.target.value)}
            placeholder="e.g. Which skill should I prioritize for backend performance?"
            className="w-full rounded-lg border border-slate-800 bg-[#060B16] px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="my-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={generateSummary}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition duration-150 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyzing skills...</span>
              </>
            ) : summary ? (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate Summary</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-blue-200" />
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
