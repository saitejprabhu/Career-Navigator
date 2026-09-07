interface Skill {
  skillId: string;
  name: string;
}

export function matchSkillsInText(text: string, skills: Skill[]): string[] {
  const lower = text.toLowerCase();
  return skills
    .filter((s) => lower.includes(s.name.toLowerCase()))
    .map((s) => s.skillId);
}

// Maps GitHub's language names to your skillId convention
export function mapGithubLanguages(
  languages: string[],
  skills: Skill[],
): string[] {
  const lowerLangs = languages.map((l) => l.toLowerCase());
  return skills
    .filter((s) => lowerLangs.includes(s.name.toLowerCase()))
    .map((s) => s.skillId);
}
