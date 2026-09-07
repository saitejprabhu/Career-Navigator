"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getReadinessScore, getReadinessLabel } from "@/utils/readiness";

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [skillStatus, setSkillStatus] = useState<Record<string, SkillStatus>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      api.get("/roles"),
      api.get("/progress/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([rolesRes, progressRes]) => {
        setRoles(rolesRes.data);
        setSkillStatus(progressRes.data);
      })
      .catch((err) => console.error("Failed to fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  const getSkillGap = (role: Role) => {
    const completed = role.requiredSkills.filter((s) => skillStatus[s]?.status);
    const missing = role.requiredSkills.filter((s) => !skillStatus[s]?.status);
    const matchPercent = Math.round(
      (completed.length / role.requiredSkills.length) * 100,
    );
    return { completed, missing, matchPercent };
  };

  if (loading) return <div className="p-8">Loading careers...</div>;

  return (
    <div className="p-8">
      {roles.map((role) => {
        const gap = getSkillGap(role);
        const readiness = getReadinessScore(skillStatus, role.requiredSkills);
        const label = getReadinessLabel(readiness);

        return (
          <div key={role.roleId} className="mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold mb-1">{role.name}</h1>
            <div className="flex gap-4 mb-3">
              <span className="text-blue-600 font-semibold">
                {gap.matchPercent}% Match
              </span>
              <span className="text-purple-600 font-semibold">
                {readiness}% — {label}
              </span>
            </div>
            <h2 className="font-semibold text-green-600">Completed:</h2>
            <ul>
              {gap.completed.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h2 className="font-semibold text-red-600 mt-2">Missing:</h2>
            <ul>
              {gap.missing.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
