interface Skill {
  skillId: string;
  name: string;
}

function normalize(text: string): string {
  let t = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ");

  // split common concatenations like "reactjs" -> "react js", "nodejs" -> "node js"
  t = t.replace(/\b(react|node|next|express|vue|angular)js\b/g, "$1 js");

  return t;
}

export function matchSkillsInText(text: string, skills: Skill[]): string[] {
  const normalized = normalize(text);

  return skills
    .filter((s) => {
      const skillWord = s.name.toLowerCase();
      const pattern = new RegExp(
        `\\b${skillWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i",
      );
      return pattern.test(normalized);
    })
    .map((s) => s.skillId);
}
