"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { getReadinessScore, getReadinessLabel } from "@/utils/readiness";

interface Role {
  roleId: string;
  name: string;
  requiredSkills: string[];
}
interface SkillRef {
  skillId: string;
  name: string;
  prerequisites: string[];
}
interface SkillStatus {
  status: string;
  lastUpdated: string;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

type Tab = "matches" | "next" | "projects";
type ProgressTab = "claimed" | "practiced" | "mastered";

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [allSkills, setAllSkills] = useState<SkillRef[]>([]);
  const [skillStatus, setSkillStatus] = useState<Record<string, SkillStatus>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("matches");
  const [progressTab, setProgressTab] = useState<ProgressTab>("practiced");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/roles"),
      api.get("/skills"),
      api.get("/progress/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([userRes, rolesRes, skillsRes, progressRes]) => {
        setName(userRes.data.name || "");
        setRoles(rolesRes.data);
        setAllSkills(skillsRes.data);
        setSkillStatus(progressRes.data);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [token, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </main>
    );
  }

  const skillName = (id: string) =>
    allSkills.find((s) => s.skillId === id)?.name || id;

  const rankedRoles = roles
    .map((role) => {
      const matched = role.requiredSkills.filter(
        (s) => skillStatus[s]?.status,
      ).length;
      const matchPercent = Math.round(
        (matched / role.requiredSkills.length) * 100,
      );
      const readiness = getReadinessScore(skillStatus, role.requiredSkills);
      return { role, matchPercent, readiness };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);

  const topRole = rankedRoles[0];
  const acquiredSkillIds = Object.keys(skillStatus);
  const visibleSkills = acquiredSkillIds.slice(0, 5);
  const extraSkillCount = acquiredSkillIds.length - visibleSkills.length;

  // "Next Skills" — required by top role but not started yet
  const nextSkills = topRole
    ? topRole.role.requiredSkills.filter((s) => !skillStatus[s]?.status)
    : [];

  // "Suggested Projects" — skills currently claimed (need project work to advance)
  const claimedSkills = Object.entries(skillStatus)
    .filter(([, s]) => s.status === "claimed")
    .map(([id]) => id);

  const skillsByStatus = (status: ProgressTab) =>
    Object.entries(skillStatus)
      .filter(([, s]) => s.status === status)
      .map(([id]) => id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header card */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-lg font-bold">
              {initials(name)}
            </div>
            <h1 className="text-xl font-bold">{name}</h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <Link
              href="/profile"
              className="text-sm border border-blue-800/50 text-blue-400 hover:bg-blue-500/10 px-4 py-1.5 rounded-full transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="/career-map"
              className="text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 px-4 py-1.5 rounded-full transition-colors"
            >
              Career Map
            </Link>
            <Link
              href="/careers"
              className="text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 px-4 py-1.5 rounded-full transition-colors"
            >
              Compare Careers
            </Link>
          </div>

          <p className="text-sm text-gray-400 mb-3">Acquired Skills</p>
          {acquiredSkillIds.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No skills yet — head to your{" "}
              <Link
                href="/career-map"
                className="text-blue-400 hover:underline"
              >
                career map
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visibleSkills.map((id) => (
                <span
                  key={id}
                  className="text-sm border border-gray-700 text-gray-200 px-3 py-1 rounded-full"
                >
                  {skillName(id)}
                </span>
              ))}
              {extraSkillCount > 0 && (
                <Link
                  href="/profile"
                  className="text-sm border border-gray-700 text-gray-400 hover:text-white px-3 py-1 rounded-full"
                >
                  {extraSkillCount} More Skills
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Career Goals - Industry Readiness Radar */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-6">
          <h2 className="font-semibold flex items-center gap-2 mb-1">
            🚩 Career Goals — Industry Readiness Radar
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Track how closely your acquired skills match the job roles
            you&apos;re targeting.
          </p>

          {!topRole ? (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-950 border border-gray-800 rounded-xl px-5 py-4">
              <div>
                <p className="text-sm">No job role goals yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Explore career roles and set one as a goal to track readiness
                  here.
                </p>
              </div>
              <Link
                href="/careers"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-lg whitespace-nowrap"
              >
                Explore Job Roles
              </Link>
            </div>
          ) : (
            <div className="bg-gray-950 border border-gray-800 rounded-xl px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{topRole.role.name}</p>
                  <p className="text-xs text-gray-500">
                    {getReadinessLabel(topRole.readiness)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">
                    {topRole.readiness}%
                  </p>
                  <p className="text-xs text-gray-500">Job Readiness</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${topRole.readiness}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Career Match: {topRole.matchPercent}%</span>
                <Link href="/careers" className="text-blue-400 hover:underline">
                  View all matches →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recommendations</h2>
            <Link
              href="/careers"
              className="text-sm text-blue-400 hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {(
              [
                ["matches", "Career Matches"],
                ["next", "Next Skills"],
                ["projects", "Suggested Projects"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`whitespace-nowrap text-sm px-4 py-1.5 rounded-full border transition-colors ${
                  tab === key
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "matches" && (
            <div className="grid md:grid-cols-3 gap-4">
              {rankedRoles
                .slice(0, 3)
                .map(({ role, matchPercent, readiness }) => (
                  <div
                    key={role.roleId}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col"
                  >
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-800/50 flex items-center justify-center text-blue-400 font-semibold text-sm mb-3">
                      {role.name[0]}
                    </div>
                    <p className="font-medium mb-1">{role.name}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {getReadinessLabel(readiness)}
                    </p>
                    <div className="flex gap-2 mb-4">
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded-full">
                        {matchPercent}% match
                      </span>
                    </div>
                    <Link
                      href="/careers"
                      className="mt-auto text-sm text-blue-400 hover:underline"
                    >
                      View more →
                    </Link>
                  </div>
                ))}
            </div>
          )}

          {tab === "next" && (
            <div className="grid md:grid-cols-3 gap-4">
              {nextSkills.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-3">
                  {topRole
                    ? "You've started every skill for your top match."
                    : "Explore a career to see next skills."}
                </p>
              ) : (
                nextSkills.map((skillId) => (
                  <div
                    key={skillId}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col"
                  >
                    <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-sm mb-3">
                      🧩
                    </div>
                    <p className="font-medium mb-1">{skillName(skillId)}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Not started yet
                    </p>
                    <Link
                      href={`/skill/${skillId}`}
                      className="mt-auto text-sm text-blue-400 hover:underline"
                    >
                      Start →
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "projects" && (
            <div className="grid md:grid-cols-3 gap-4">
              {claimedSkills.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-3">
                  No skills waiting on a project right now.
                </p>
              ) : (
                claimedSkills.map((skillId) => (
                  <div
                    key={skillId}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col"
                  >
                    <div className="h-9 w-9 rounded-full bg-amber-500/10 border border-amber-800/50 flex items-center justify-center text-sm mb-3">
                      📁
                    </div>
                    <p className="font-medium mb-1">{skillName(skillId)}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Build a project to prove it
                    </p>
                    <Link
                      href={`/skill/${skillId}`}
                      className="mt-auto text-sm text-blue-400 hover:underline"
                    >
                      View more →
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Your Progress */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Progress</h2>
            <Link
              href="/profile"
              className="text-sm text-blue-400 hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {(
              [
                ["claimed", "Claimed"],
                ["practiced", "Practiced"],
                ["mastered", "Mastered"],
              ] as [ProgressTab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setProgressTab(key)}
                className={`whitespace-nowrap text-sm px-4 py-1.5 rounded-full border transition-colors ${
                  progressTab === key
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {skillsByStatus(progressTab).length === 0 ? (
              <p className="text-sm text-gray-600">
                No skills in this stage yet.
              </p>
            ) : (
              skillsByStatus(progressTab).map((id) => (
                <span
                  key={id}
                  className="text-sm border border-gray-700 text-gray-200 px-3 py-1.5 rounded-full"
                >
                  {skillName(id)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
