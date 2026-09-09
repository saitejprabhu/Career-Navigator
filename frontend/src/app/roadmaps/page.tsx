"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  Target,
  Map,
  BookOpen,
  FolderKanban,
  Trophy,
  Lock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import api from "@/lib/api";
import { getReadinessScore, getReadinessLabel } from "@/utils/readiness";

interface Role {
  roleId: string;
  name: string;
  requiredSkills: string[];
}

interface Skill {
  skillId: string;
  name: string;
}

interface SkillStatus {
  status: string;
  lastUpdated: string;
}

export default function RoadmapsPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [enrolledRoles, setEnrolledRoles] = useState<string[]>([]);
  const [skillStatus, setSkillStatus] = useState<Record<string, SkillStatus>>(
    {},
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/roles"),
      api.get("/skills"),
      api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      api.get("/progress/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(([rolesRes, skillsRes, userRes, progressRes]) => {
        setRoles(rolesRes.data);
        setSkills(skillsRes.data);

        setEnrolledRoles(userRes.data.enrolledRoles || []);

        setSkillStatus(progressRes.data || {});
      })
      .catch((error) => {
        console.error("Failed to load roadmaps:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getSkillName = (skillId: string) => {
    return skills.find((skill) => skill.skillId === skillId)?.name || skillId;
  };

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();

    if (name.includes("frontend") || name.includes("front end")) {
      return "🌐";
    }

    if (name.includes("backend") || name.includes("back end")) {
      return "⚙️";
    }

    if (name.includes("ai") || name.includes("machine learning")) {
      return "🤖";
    }

    if (name.includes("data")) {
      return "📊";
    }

    if (name.includes("cloud") || name.includes("devops")) {
      return "☁️";
    }

    if (name.includes("security") || name.includes("cyber")) {
      return "🔐";
    }

    if (name.includes("mobile")) {
      return "📱";
    }

    return "💻";
  };

  const getRoleProgress = (role: Role) => {
    const completed = role.requiredSkills.filter(
      (skillId) => skillStatus[skillId]?.status,
    );

    const remaining = role.requiredSkills.filter(
      (skillId) => !skillStatus[skillId]?.status,
    );

    const percentage =
      role.requiredSkills.length > 0
        ? Math.round((completed.length / role.requiredSkills.length) * 100)
        : 0;

    return {
      completed,
      remaining,
      percentage,
    };
  };

  /*
   * Find the first incomplete skill.
   *
   * This becomes the user's "Current Focus".
   */
  const getNextSkill = (role: Role) => {
    return role.requiredSkills.find((skillId) => !skillStatus[skillId]?.status);
  };

  /* =====================================================
     ENROLLED ROLES
  ===================================================== */

  const enrolledRoleObjects = roles.filter((role) =>
    enrolledRoles.includes(role.roleId),
  );

  /* =====================================================
     OVERALL PROGRESS
  ===================================================== */

  const totalSkills = enrolledRoleObjects.reduce(
    (total, role) => total + role.requiredSkills.length,
    0,
  );

  const completedSkills = enrolledRoleObjects.reduce(
    (total, role) =>
      total +
      role.requiredSkills.filter((skillId) => skillStatus[skillId]?.status)
        .length,
    0,
  );

  const overallProgress =
    totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />

          <p className="text-sm text-slate-500">Loading your roadmaps...</p>
        </div>
      </main>
    );
  }

  /* =====================================================
     NO ROADMAPS
  ===================================================== */

  if (enrolledRoleObjects.length === 0) {
    return (
      <main className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Map className="h-7 w-7 text-blue-400" />
            </div>

            <h1 className="mt-5 text-2xl font-bold">No roadmaps yet</h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Choose a career path first. Once you enroll, your personalized
              learning roadmap will appear here.
            </p>

            <button
              onClick={() => router.push("/careers")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
            >
              Explore Careers
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Map className="w-5 h-5 text-blue-400" />

              <span className="text-sm font-medium text-blue-400">
                Learning Paths
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">My Roadmaps</h1>

            <p className="mt-2 text-sm text-slate-500">
              Continue learning and build the skills required for your career
              goals.
            </p>
          </div>

          {/* Overall progress */}

          <div className="min-w-[230px] rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Overall progress</span>

              <span className="text-sm font-semibold text-white">
                {overallProgress}%
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{
                  width: `${overallProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[11px] text-slate-600">
              {completedSkills} of {totalSkills} skills completed
            </p>
          </div>
        </div>

        {/* =================================================
            CURRENT FOCUS
        ================================================= */}

        {(() => {
          const firstRole = enrolledRoleObjects[0];
          const nextSkill = getNextSkill(firstRole);

          if (!nextSkill) return null;

          return (
            <section className="relative overflow-hidden mt-8 rounded-2xl border border-blue-500/20 bg-[#0B1120] p-6">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>

                    <span className="text-xs font-medium uppercase tracking-wider text-blue-400">
                      Current Focus
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-white">
                    {getSkillName(nextSkill)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your next recommended skill in the {firstRole.name} pathway.
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/career-map?role=${firstRole.roleId}`)
                  }
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          );
        })()}

        {/* =================================================
            ROADMAPS
        ================================================= */}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">Active Roadmaps</h2>

              <p className="mt-1 text-xs text-slate-500">
                Your enrolled career pathways.
              </p>
            </div>

            <span className="text-xs text-slate-600">
              {enrolledRoleObjects.length} active
            </span>
          </div>

          <div className="space-y-5">
            {enrolledRoleObjects.map((role) => {
              const progress = getRoleProgress(role);

              const readiness = getReadinessScore(
                skillStatus,
                role.requiredSkills,
              );

              const readinessLabel = getReadinessLabel(readiness);

              const nextSkill = getNextSkill(role);

              const icon = getRoleIcon(role.name);

              return (
                <section
                  key={role.roleId}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120]"
                >
                  {/* =========================================
                      ROADMAP HEADER
                  ========================================= */}

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-xl">
                          {icon}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-semibold text-white">
                              {role.name}
                            </h3>

                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                              Active
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            Career learning pathway
                          </p>
                        </div>
                      </div>

                      {/* Readiness */}

                      <div className="text-left lg:text-right">
                        <p className="text-xs text-slate-500">
                          Career readiness
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {readiness}%
                        </p>

                        <p className="text-[11px] text-blue-400">
                          {readinessLabel}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">
                          Roadmap progress
                        </span>

                        <span className="text-xs font-medium text-slate-300">
                          {progress.completed.length} /{" "}
                          {role.requiredSkills.length} skills
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* =========================================
                      CURRENT SKILL
                  ========================================= */}

                  {nextSkill && (
                    <div className="border-y border-slate-800 bg-[#060B16] px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                          </div>

                          <div>
                            <p className="text-[11px] text-slate-600 uppercase tracking-wide">
                              Next skill
                            </p>

                            <p className="text-sm font-medium text-slate-200">
                              {getSkillName(nextSkill)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push("/career-map")}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =========================================
                      SKILLS
                  ========================================= */}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-white">
                        Skills
                      </h4>

                      <span className="text-[11px] text-slate-600">
                        {role.requiredSkills.length} total
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {role.requiredSkills.map((skillId, index) => {
                        const completed = !!skillStatus[skillId]?.status;

                        const isNext = skillId === nextSkill;

                        return (
                          <div
                            key={skillId}
                            className={`
                                flex items-center gap-3
                                rounded-lg
                                border
                                px-3 py-2.5
                                ${
                                  completed
                                    ? "border-emerald-500/20 bg-emerald-500/5"
                                    : isNext
                                      ? "border-blue-500/30 bg-blue-500/5"
                                      : "border-slate-800 bg-[#060B16]"
                                }
                              `}
                          >
                            <div className="shrink-0">
                              {completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : isNext ? (
                                <Target className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-700" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`
                                    text-xs truncate
                                    ${
                                      completed
                                        ? "text-emerald-400"
                                        : isNext
                                          ? "text-blue-400"
                                          : "text-slate-400"
                                    }
                                  `}
                              >
                                {getSkillName(skillId)}
                              </p>

                              {isNext && (
                                <p className="text-[10px] text-blue-500/70 mt-0.5">
                                  Next
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* =======================================
                        ACTIONS
                    ======================================= */}

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => router.push("/career-map")}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
                      >
                        Continue Learning
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => router.push("/career-map")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-[#060B16] px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
                      >
                        <Map className="w-4 h-4" />
                        View Career Map
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* =================================================
            BOTTOM INFO
        ================================================= */}

        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>

            <h3 className="mt-3 text-sm font-medium text-white">
              Learn skills
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Follow the recommended skill order and build your foundation step
              by step.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
              <FolderKanban className="w-4 h-4 text-purple-400" />
            </div>

            <h3 className="mt-3 text-sm font-medium text-white">
              Build projects
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Turn the skills you learn into practical projects that strengthen
              your portfolio.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>

            <h3 className="mt-3 text-sm font-medium text-white">
              Become career ready
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Complete your roadmap and move closer to your target career.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
