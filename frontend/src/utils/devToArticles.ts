export interface DevToArticle {
  title: string;
  url: string;
  readable_publish_date: string;
}

/**
 * Dev.to tags contain only lowercase letters and digits, so skill IDs like
 * "node.js", "C++" or "machine-learning" can't be used as tags directly.
 * This table maps common skill IDs / names to real Dev.to tags. Keys are
 * matched first as the raw lowercase ID, then with punctuation stripped
 * (so "node-js", "Node.js" and "nodejs" all resolve). Anything not listed
 * falls back to the stripped ID itself. Verify a tag at dev.to/t/<tag>.
 */
const TAG_ALIASES: Record<string, string> = {
  // Web fundamentals
  html: "html",
  html5: "html",
  css: "css",
  css3: "css",
  js: "javascript",
  javascript: "javascript",
  es6: "javascript",
  ts: "typescript",
  typescript: "typescript",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",

  // Frontend frameworks
  react: "react",
  reactjs: "react",
  nextjs: "nextjs",
  vue: "vue",
  vuejs: "vue",
  angular: "angular",
  angularjs: "angular",
  svelte: "svelte",

  // Backend
  node: "node",
  nodejs: "node",
  express: "express",
  expressjs: "express",
  django: "django",
  flask: "flask",
  spring: "spring",
  springboot: "springboot",
  api: "api",
  rest: "api",
  restapi: "api",
  graphql: "graphql",

  // Databases
  sql: "sql",
  mysql: "mysql",
  postgres: "postgres",
  postgresql: "postgres",
  mongo: "mongodb",
  mongodb: "mongodb",
  redis: "redis",
  sqlite: "sqlite",
  firebase: "firebase",

  // Tools & infrastructure
  git: "git",
  github: "github",
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  linux: "linux",
  aws: "aws",
  azure: "azure",
  devops: "devops",
  cicd: "cicd",
  "ci/cd": "cicd",
  testing: "testing",
  jest: "jest",

  // Languages
  py: "python",
  python: "python",
  java: "java",
  go: "go",
  golang: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  kotlin: "kotlin",
  dart: "dart",
  flutter: "flutter",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  csharp: "csharp",

  // Data & AI
  ml: "machinelearning",
  machinelearning: "machinelearning",
  ai: "ai",
  datascience: "datascience",
  pandas: "pandas",
};

export function toDevToTag(skillId: string): string {
  const raw = skillId.trim().toLowerCase();
  if (TAG_ALIASES[raw]) return TAG_ALIASES[raw];

  const stripped = raw.replace(/[^a-z0-9]/g, "");
  return TAG_ALIASES[stripped] ?? stripped;
}

// `top=N` means "most popular articles from the last N days". Smaller tags
// often have nothing in 7 days, so widen the window until we find something.
const TOP_WINDOWS_IN_DAYS = [7, 30, 365];
const MAX_ARTICLES = 3;

// In-memory cache so reopening a skill doesn't refetch.
const cache = new Map<string, DevToArticle[]>();

/**
 * @param skillId  the skill's ID (used to derive the tag if none is given)
 * @param tag      optional explicit Dev.to tag; takes priority over skillId
 */
export async function fetchTrendingArticles(
  skillId: string,
  tag?: string,
): Promise<DevToArticle[]> {
  const devToTag = tag ?? toDevToTag(skillId);
  if (!devToTag) return [];

  const cached = cache.get(devToTag);
  if (cached) return cached;

  for (const days of TOP_WINDOWS_IN_DAYS) {
    try {
      const res = await fetch(
        `https://dev.to/api/articles?tag=${encodeURIComponent(devToTag)}&top=${days}&per_page=${MAX_ARTICLES}`,
      );
      if (!res.ok) return [];

      const data: unknown = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      const articles: DevToArticle[] = data.slice(0, MAX_ARTICLES).map((a) => ({
        title: a.title,
        url: a.url,
        readable_publish_date: a.readable_publish_date,
      }));

      cache.set(devToTag, articles);
      return articles;
    } catch {
      return [];
    }
  }

  cache.set(devToTag, []);
  return [];
}
