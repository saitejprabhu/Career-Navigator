export interface SkillResource {
  description: string;
  whyItMatters: string;
  videoTitle: string;
  videoUrl: string;
  docTitle: string;
  docUrl: string;
  certificationTitle?: string;
  certificationUrl?: string;
  estimatedTime: string; // e.g. "1-2 weeks"
}

export const SKILL_RESOURCES: Record<string, SkillResource> = {
  html: {
    description:
      "HTML (HyperText Markup Language) is the standard markup language used to structure content on the web — headings, paragraphs, links, images, and forms.",
    whyItMatters:
      "Every web page starts with HTML. It's the foundation every other frontend skill (CSS, JavaScript, React) builds on top of.",
    videoTitle: "HTML Crash Course For Absolute Beginners",
    videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
    docTitle: "MDN: HTML Basics",
    docUrl: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
    certificationTitle: "freeCodeCamp: Responsive Web Design",
    certificationUrl:
      "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    estimatedTime: "1 week",
  },
  css: {
    description:
      "CSS (Cascading Style Sheets) controls the visual presentation of a web page — layout, colors, spacing, and responsiveness.",
    whyItMatters:
      "Without CSS, every website would look like plain, unstyled text. It's essential for building anything users would actually want to use.",
    videoTitle: "CSS Crash Course For Absolute Beginners",
    videoUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI",
    docTitle: "MDN: CSS Basics",
    docUrl: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
    certificationTitle: "freeCodeCamp: Responsive Web Design",
    certificationUrl:
      "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    estimatedTime: "1-2 weeks",
  },
  javascript: {
    description:
      "JavaScript is the programming language that adds interactivity and logic to web pages — form validation, dynamic content, API calls, and more.",
    whyItMatters:
      "JavaScript is what turns a static page into an interactive application. It's required for virtually every frontend and full-stack role.",
    videoTitle: "JavaScript Crash Course For Beginners",
    videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
    docTitle: "MDN: JavaScript Guide",
    docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    certificationTitle:
      "freeCodeCamp: JavaScript Algorithms and Data Structures",
    certificationUrl:
      "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    estimatedTime: "3-4 weeks",
  },
  react: {
    description:
      "React is a JavaScript library for building user interfaces using reusable components and a declarative programming style.",
    whyItMatters:
      "React is one of the most widely used frontend frameworks in the industry — a strong signal of employability for frontend and full-stack roles.",
    videoTitle: "React JS Crash Course",
    videoUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
    docTitle: "React Official Docs",
    docUrl: "https://react.dev/learn",
    estimatedTime: "3-4 weeks",
  },
  nodejs: {
    description:
      "Node.js is a JavaScript runtime that lets you run JavaScript on the server, enabling backend development with the same language used in the browser.",
    whyItMatters:
      "Node.js allows full-stack developers to use one language (JavaScript) across both frontend and backend, and powers many production-grade APIs.",
    videoTitle: "Node.js Crash Course",
    videoUrl: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
    docTitle: "Node.js Official Docs",
    docUrl: "https://nodejs.org/en/docs",
    estimatedTime: "2-3 weeks",
  },
  git: {
    description:
      "Git is a distributed version control system that tracks changes to code, allowing developers to collaborate, review history, and safely experiment with branches.",
    whyItMatters:
      "Git is used on virtually every professional software team. It's often the very first skill employers expect, regardless of role or tech stack.",
    videoTitle: "Git and GitHub for Beginners",
    videoUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    docTitle: "Git Official Documentation",
    docUrl: "https://git-scm.com/doc",
    estimatedTime: "3-5 days",
  },
  typescript: {
    description:
      "TypeScript is a typed superset of JavaScript that adds static type-checking, catching errors during development rather than at runtime.",
    whyItMatters:
      "TypeScript is now standard in most professional React and Node.js codebases — it's frequently listed as a requirement, not just a nice-to-have.",
    videoTitle: "TypeScript Course for Beginners",
    videoUrl: "https://www.youtube.com/watch?v=BwuLxPH8IDs",
    docTitle: "TypeScript Official Handbook",
    docUrl: "https://www.typescriptlang.org/docs/handbook/intro.html",
    estimatedTime: "1-2 weeks",
  },
};

export function getSkillResource(skillId: string): SkillResource | null {
  return SKILL_RESOURCES[skillId] || null;
}
