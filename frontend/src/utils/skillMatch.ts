interface Skill {
  skillId: string;
  name: string;
}

const ALIASES: Record<string, string[]> = {
  javascript: ["js", "ecmascript", "javascript", "reactjs", "nodejs"],
  typescript: ["ts", "typescript"],
  react: ["reactjs", "react.js", "react"],
  "next.js": ["nextjs", "next.js", "next"],
  "node.js": ["nodejs", "node.js", "node"],
  html: ["html5", "html"],
  css: ["css3", "css", "tailwind", "bootstrap"],
  python: ["py", "python", "python3"],
  mongodb: ["mongo", "mongodb"],
  express: ["expressjs", "express.js", "express"],
  git: ["github", "git"],
  docker: ["containerization", "docker"],
  aws: ["amazon web services", "cloud", "aws"],
  sql: ["postgresql", "mysql", "sqlite", "sql"],
};

function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function matchSkillsInText(text: string, skills: Skill[]): string[] {
  const lowerText = text.toLowerCase();
  const cleanedText = cleanText(text);

  const matchedIds = new Set<string>();

  for (const s of skills) {
    const sNameLower = s.name.toLowerCase();
    const cleanSkill = cleanText(s.name).trim();

    // 1. Direct inclusion in raw lowerText
    if (sNameLower.length > 2 && lowerText.includes(sNameLower)) {
      matchedIds.add(s.skillId);
      continue;
    }

    // 2. Word boundary match on cleaned text
    if (cleanSkill.length > 1) {
      const regex = new RegExp(`\\b${cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(cleanedText)) {
        matchedIds.add(s.skillId);
        continue;
      }
    }

    // 3. Check aliases
    const aliasList = ALIASES[sNameLower] || ALIASES[cleanSkill] || [];
    for (const alias of aliasList) {
      const aliasRegex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (aliasRegex.test(cleanedText) || lowerText.includes(alias)) {
        matchedIds.add(s.skillId);
        break;
      }
    }
  }

  return Array.from(matchedIds);
}
