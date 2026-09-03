// frontend/src/data/skills.ts
export const skills = [
  { id: "html", name: "HTML", prerequisites: [] },
  { id: "css", name: "CSS", prerequisites: ["html"] },
  { id: "javascript", name: "JavaScript", prerequisites: ["html", "css"] },
  { id: "react", name: "React", prerequisites: ["javascript"] },
];

export const roles = [
  {
    id: "frontend-dev",
    name: "Frontend Developer",
    requiredSkills: ["html", "css", "javascript", "react"],
  },
];
