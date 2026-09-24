// frontend/src/utils/skillGap.ts
import { roles, RoleData } from "@/data/skills";

export function getSkillGap(userSkills: string[], roleId: string) {
  const role = roles.find((r: RoleData) => r.id === roleId);
  if (!role) return { completed: [], missing: [], matchPercent: 0 };

  const completed = role.requiredSkills.filter((s: string) => userSkills.includes(s));
  const missing = role.requiredSkills.filter((s: string) => !userSkills.includes(s));

  return {
    completed,
    missing,
    matchPercent: role.requiredSkills.length > 0
      ? Math.round((completed.length / role.requiredSkills.length) * 100)
      : 0,
  };
}
