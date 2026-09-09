export type SectionKey =
  | "education"
  | "experience"
  | "internships"
  | "certifications"
  | "hackathons"
  | "projects"
  | "interests";

const SECTION_KEYWORDS: Record<SectionKey, string[]> = {
  education: ["education", "academic background", "academics", "qualification"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
  ],
  internships: ["internship", "internships"],
  certifications: [
    "certification",
    "certifications",
    "courses",
    "courses & certifications",
    "licenses",
  ],
  hackathons: ["hackathon", "hackathons"],
  projects: ["project", "projects", "personal projects"],
  interests: ["interest", "interests", "hobbies"],
};

// Headers that mark content we deliberately ignore (so we stop grabbing lines once we hit them)
const IGNORE_HEADERS = [
  "skills",
  "contact",
  "summary",
  "objective",
  "references",
  "languages",
  "achievements",
  "awards",
];

function matchHeader(line: string): SectionKey | "ignore" | null {
  const clean = line
    .trim()
    .toLowerCase()
    .replace(/[:\-–]+$/, "");
  if (!clean || clean.length > 40) return null;

  for (const [key, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some((kw) => clean === kw || clean.startsWith(kw))) {
      return key as SectionKey;
    }
  }
  if (IGNORE_HEADERS.some((kw) => clean === kw || clean.startsWith(kw))) {
    return "ignore";
  }
  return null;
}

export function parseResumeSections(
  text: string,
): Record<SectionKey, string[]> {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result: Record<SectionKey, string[]> = {
    education: [],
    experience: [],
    internships: [],
    certifications: [],
    hackathons: [],
    projects: [],
    interests: [],
  };

  let current: SectionKey | null = null;

  for (const line of lines) {
    const header = matchHeader(line);
    if (header === "ignore") {
      current = null;
      continue;
    }
    if (header) {
      current = header;
      continue;
    }

    if (current && line.length > 3 && line.length < 200) {
      const cleaned = line.replace(/^[•▪◦\-*]\s*/, "").trim();
      if (cleaned) result[current].push(cleaned);
    }
  }

  (Object.keys(result) as SectionKey[]).forEach((k) => {
    result[k] = Array.from(new Set(result[k])).slice(0, 8);
  });

  return result;
}
