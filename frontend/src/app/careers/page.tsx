"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useCareerStore } from "@/store/useCareerStore";

interface Role {
  roleId: string;
  name: string;
  requiredSkills: string[];
}

export default function CareersPage() {
  const { profile } = useCareerStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/roles")
      .then((res) => setRoles(res.data))
      .catch((err) => console.error("Failed to fetch roles:", err))
      .finally(() => setLoading(false));
  }, []);

  const getSkillGap = (role: Role) => {
    const completed = role.requiredSkills.filter((s) =>
      profile.skills.includes(s),
    );
    const missing = role.requiredSkills.filter(
      (s) => !profile.skills.includes(s),
    );
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
        return (
          <div key={role.roleId} className="mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold mb-2">
              {role.name} — {gap.matchPercent}% Match
            </h1>
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
