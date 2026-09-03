import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CareerStore {
  profile: {
    skills: string[];
    education: string[];
    certifications: string[];
    projects: string[];
    experience: string[];
    interests: string[];
  };
  skillStatus: Record<string, { status: string; lastUpdated: string }>;
  streak: {
    count: number;
    lastActiveDate: string | null;
    freezesAvailable: number;
  };
  badges: string[];

  setProfile: (profile: Partial<CareerStore["profile"]>) => void;
}

export const useCareerStore = create<CareerStore>()(
  persist(
    (set) => ({
      profile: {
        skills: [],
        education: [],
        certifications: [],
        projects: [],
        experience: [],
        interests: [],
      },
      skillStatus: {},
      streak: { count: 0, lastActiveDate: null, freezesAvailable: 0 },
      badges: [],

      setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),
    }),
    { name: "career-navigator-storage" },
  ),
);
