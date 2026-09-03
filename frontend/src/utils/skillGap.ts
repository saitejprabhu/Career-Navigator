// frontend/src/utils/skillGap.ts
import { roles } from "@/data/skills";

export function getSkillGap(userSkills: string[], roleId: string) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return { completed: [], missing: [] };

  const completed = role.requiredSkills.filter((s) => userSkills.includes(s));
  const missing = role.requiredSkills.filter((s) => !userSkills.includes(s));

  return {
    completed,
    missing,
    matchPercent: Math.round(
      (completed.length / role.requiredSkills.length) * 100,
    ),
  };
}
