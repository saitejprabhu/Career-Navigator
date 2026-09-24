export type SectionKey =
  | "education"
  | "experience"
  | "internships"
  | "certifications"
  | "hackathons"
  | "projects"
  | "interests";

const SECTION_KEYWORDS: Record<SectionKey, string[]> = {
  education: ["education", "academic background", "academics", "qualification", "degree", "schooling", "university"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "work history",
    "career summary",
  ],
  internships: ["internship", "internships", "apprentice", "trainee"],
  certifications: [
    "certification",
    "certifications",
    "courses",
    "courses & certifications",
    "licenses",
    "certificates",
    "credentials",
  ],
  hackathons: ["hackathon", "hackathons", "competitions", "coding contests"],
  projects: ["project", "projects", "personal projects", "key projects", "academic projects"],
  interests: ["interest", "interests", "hobbies", "extra-curricular", "extracurricular"],
};

// Headers that mark content we ignore (e.g. contact info / reference lists)
const IGNORE_HEADERS = [
  "contact",
  "references",
  "declaration",
];

function matchHeader(line: string): SectionKey | "ignore" | null {
  const clean = line
    .trim()
    .toLowerCase()
    .replace(/[:\-–|]+$/, "");
  if (!clean || clean.length > 50) return null;

  for (const [key, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some((kw) => clean === kw || clean.startsWith(kw) || clean.endsWith(kw))) {
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

    if (current && line.length > 2 && line.length < 250) {
      const cleaned = line.replace(/^[•▪◦\-*–\d+\.]\s*/, "").trim();
      if (cleaned && !matchHeader(cleaned)) {
        result[current].push(cleaned);
      }
    }
  }

  (Object.keys(result) as SectionKey[]).forEach((k) => {
    result[k] = Array.from(new Set(result[k])).slice(0, 10);
  });

  return result;
}
