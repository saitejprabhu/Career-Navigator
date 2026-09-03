// frontend/src/app/careers/page.tsx
"use client";
import { useCareerStore } from "@/store/useCareerStore";
import { getSkillGap } from "@/utils/skillGap";

export default function CareersPage() {
  const { profile } = useCareerStore();
  const gap = getSkillGap(profile.skills, "frontend-dev");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Frontend Developer — {gap.matchPercent}% Match
      </h1>
      <h2 className="font-semibold text-green-600">Completed:</h2>
      <ul>
        {gap.completed.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <h2 className="font-semibold text-red-600 mt-4">Missing:</h2>
      <ul>
        {gap.missing.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
