"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  Target,
  TrendingUp,
} from "lucide-react";

import api from "@/lib/api";
import { getReadinessScore, getReadinessLabel } from "@/utils/readiness";
import CareerDiscoveryChatbot from "@/components/CareerDiscoveryChatbot";
import SalaryInsightsCard from "@/components/SalaryInsightsCard";

interface Role {
  roleId: string;
  name: string;
  requiredSkills: string[];
}

interface SkillStatus {
  status: string;
  lastUpdated: string;
}

export default function CareersPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [skillStatus, setSkillStatus] = useState<Record<string, SkillStatus>>(
    {},
  );

  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/roles"),
      api.get("/progress/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(([rolesRes, progressRes, userRes]) => {
        setRoles(rolesRes.data);
        setSkillStatus(progressRes.data);

        setEnrolled(userRes.data.enrolledRoles || []);
      })
      .catch((err) => {
        console.error("Failed to fetch careers:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const getSkillGap = (role: Role) => {
    const completed = role.requiredSkills.filter(
      (skill) => skillStatus[skill]?.status,
    );

    const missing = role.requiredSkills.filter(
      (skill) => !skillStatus[skill]?.status,
    );

    const matchPercent =
      role.requiredSkills.length > 0
        ? Math.round((completed.length / role.requiredSkills.length) * 100)
        : 0;

    return {
      completed,
      missing,
      matchPercent,
    };
  };

  /*
   * IMPORTANT:
   * Connect this function to your backend enrollment endpoint.
   *
   * I have not assumed an endpoint here because your current code
   * only shows GET /roles, GET /progress/me and GET /users/me.
   */
  const enrollInCareer = async (roleId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const updated = enrolled.includes(roleId)
      ? enrolled
      : [...enrolled, roleId];

    try {
      await api.put(
        "/users/me/roles",
        { enrolledRoles: updated },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEnrolled(updated);
      router.push("/career-map");
    } catch (error) {
      console.error("Failed to enroll:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading career paths...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="px-6 py-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />

                <span className="text-sm font-medium text-blue-400">
                  Career Planning
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Choose your career path
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore different career paths, understand the skills required,
                and choose the path you want to work towards.
              </p>
            </div>

            {/* Enrolled count */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>

              <div>
                <p className="text-[11px] text-slate-500">Your pathways</p>

                <p className="text-sm font-semibold text-white">
                  {enrolled.length} enrolled
                </p>
              </div>
            </div>
          </div>

          {/* AI Career Discovery Assistant */}
          <CareerDiscoveryChatbot roles={roles} />

          {/* =================================================
              CAREER PATHS
          ================================================= */}

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Career pathways
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Choose a path that matches your goals.
                </p>
              </div>

              <span className="text-xs text-slate-600">
                {roles.length} paths available
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {roles.map((role) => {
                const gap = getSkillGap(role);

                const readiness = getReadinessScore(
                  skillStatus,
                  role.requiredSkills,
                );

                const label = getReadinessLabel(readiness);

                const isEnrolled = enrolled.includes(role.roleId);

                return (
                  <div
                    key={role.roleId}
                    className={`
                      group relative overflow-hidden
                      rounded-2xl border
                      bg-[#0B1120]
                      p-5
                      transition-all duration-200
                      ${
                        isEnrolled
                          ? "border-blue-500/40"
                          : "border-slate-800 hover:border-slate-700"
                      }
                    `}
                  >
                    {/* Subtle glow */}
                    <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition" />

                    <div className="relative">
                      {/* Top */}
                      <div className="flex items-start justify-between">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Code2 className="w-5 h-5 text-blue-400" />
                        </div>

                        {isEnrolled && (
                          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Enrolled
                          </span>
                        )}
                      </div>

                      {/* Career name */}
                      <h3 className="mt-5 text-lg font-semibold text-white">
                        {role.name}
                      </h3>

                      <p className="mt-2 text-sm leading-5 text-slate-500">
                        Build the skills required to become a {role.name}.
                      </p>

                      {/* Readiness */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">
                            Your readiness
                          </span>

                          <span className="text-xs font-medium text-slate-300">
                            {readiness}% · {label}
                          </span>
                        </div>

                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                            style={{
                              width: `${readiness}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Match */}
                      <div className="mt-5 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">
                            Skill match
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-blue-400">
                            {gap.matchPercent}%
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-slate-500">
                            Required skills
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-white">
                            {role.requiredSkills.length}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {role.requiredSkills.slice(0, 5).map((skill) => {
                          const completed = !!skillStatus[skill]?.status;

                          return (
                            <span
                              key={skill}
                              className={`
                                  flex items-center gap-1.5
                                  rounded-md
                                  border
                                  px-2 py-1
                                  text-[11px]
                                  ${
                                    completed
                                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                                      : "border-slate-800 bg-[#060B16] text-slate-500"
                                  }
                                `}
                            >
                              {completed ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}

                              {skill}
                            </span>
                          );
                        })}

                        {role.requiredSkills.length > 5 && (
                          <span className="px-2 py-1 text-[11px] text-slate-600">
                            +{role.requiredSkills.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Salary Insights */}
                      <SalaryInsightsCard roleName={role.name} />

                      {/* Action */}
                      <div className="mt-6">
                        {isEnrolled ? (
                          <button
                            onClick={() =>
                              router.push(`/career-map?role=${role.roleId}`)
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-400 hover:bg-blue-500/15 transition"
                          >
                            Continue pathway
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => enrollInCareer(role.roleId)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
                          >
                            Enroll in pathway
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
