interface SkillStatus {
  status: string;
  lastUpdated: string;
}

const WEIGHTS: Record<string, number> = {
  mastered: 1,
  practiced: 0.6,
  claimed: 0.25,
};

export function getReadinessScore(
  skillStatus: Record<string, SkillStatus>,
  requiredSkills: string[],
): number {
  if (requiredSkills.length === 0) return 0;

  let total = 0;
  requiredSkills.forEach((skillId) => {
    const status = skillStatus[skillId]?.status;
    total += WEIGHTS[status] || 0;
  });

  return Math.round((total / requiredSkills.length) * 100);
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return "Interview Ready";
  if (score >= 55) return "Nearly Job Ready";
  if (score >= 30) return "Developing Readiness";
  if (score > 0) return "Building Skills";
  return "Getting Started";
}
