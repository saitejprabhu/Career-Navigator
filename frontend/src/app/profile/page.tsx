"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { extractTextFromFile } from "@/utils/resumeParser";
import { matchSkillsInText } from "@/utils/skillMatch";
import { parseResumeSections, SectionKey } from "@/utils/resumeSectionParser";
import {
  User,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  FileText,
  Upload,
  Plus,
  X,
  Award,
  Code2,
  BookOpen,
  Trophy,
  FolderGit2,
  Heart,
  Save,
  LogOut,
  CheckCircle2,
  Pencil,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   Badge Names
========================================================= */

const BADGE_NAMES: Record<string, string> = {
  "getting-started": "Getting Started",
  "consistent-learner": "Consistent Learner",
  "dedicated-learner": "Dedicated Learner",
  unstoppable: "Unstoppable",
};

/* =========================================================
   Types
========================================================= */

type ProfileData = {
  bio: string;
  location: string;
  github: string;
  linkedin: string;
  instagram: string;

  skills: string[];
  education: string[];
  certifications: string[];
  projects: string[];
  experience: string[];
  internships: string[];
  hackathons: string[];
  interests: string[];
};

type SkillRef = {
  skillId: string;
  name: string;
};

type ProfileTextKey = "bio" | "location" | "github" | "linkedin" | "instagram";

type ListKey = Exclude<keyof ProfileData, ProfileTextKey>;

/* =========================================================
   Empty Profile
========================================================= */

const EMPTY_PROFILE: ProfileData = {
  bio: "",
  location: "",
  github: "",
  linkedin: "",
  instagram: "",

  skills: [],
  education: [],
  certifications: [],
  projects: [],
  experience: [],
  internships: [],
  hackathons: [],
  interests: [],
};

/* =========================================================
   Profile Tabs
========================================================= */

const TAB_CONFIG: {
  key: ListKey;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "education",
    label: "Education",
    placeholder: "e.g. B.Tech IT, Goa College of Engineering",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    key: "experience",
    label: "Experience",
    placeholder: "e.g. Frontend Developer Intern at XYZ Corp",
    icon: <BriefcaseBusiness className="w-4 h-4" />,
  },
  {
    key: "internships",
    label: "Internships",
    placeholder: "e.g. Summer Intern at ABC Ltd",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    key: "certifications",
    label: "Certifications",
    placeholder: "e.g. AWS Cloud Practitioner",
    icon: <Award className="w-4 h-4" />,
  },
  {
    key: "hackathons",
    label: "Hackathons",
    placeholder: "e.g. Smart India Hackathon 2026 — Finalist",
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    key: "projects",
    label: "Projects",
    placeholder: "e.g. Portfolio website with Next.js",
    icon: <FolderGit2 className="w-4 h-4" />,
  },
  {
    key: "interests",
    label: "Interests",
    placeholder: "e.g. Web development, AI",
    icon: <Heart className="w-4 h-4" />,
  },
];

/* =========================================================
   Helpers
========================================================= */

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

/* =========================================================
   Profile Page
========================================================= */

export default function ProfilePage() {
  const router = useRouter();

  /* -------------------------
     Basic user information
  ------------------------- */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  /* -------------------------
     Name editing
  ------------------------- */

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  /* -------------------------
     Profile
  ------------------------- */

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);

  /* -------------------------
     Inputs
  ------------------------- */

  const [inputs, setInputs] = useState<Record<string, string>>({});

  const [skillInput, setSkillInput] = useState("");

  /* -------------------------
     Skills
  ------------------------- */

  const [allSkills, setAllSkills] = useState<SkillRef[]>([]);

  /* -------------------------
     Badges / streak
  ------------------------- */

  const [badges, setBadges] = useState<string[]>([]);

  const [streak, setStreak] = useState<{
    count: number;
    freezesAvailable: number;
  } | null>(null);

  /* -------------------------
     UI states
  ------------------------- */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [editingAbout, setEditingAbout] = useState(false);

  const [editingSkills, setEditingSkills] = useState(false);

  const [showAllSkills, setShowAllSkills] = useState(false);

  const [activeTab, setActiveTab] = useState<ListKey>("education");

  /* -------------------------
     Inline item editing (Education, Experience, etc.)
  ------------------------- */

  const [editingItem, setEditingItem] = useState<{
    key: ListKey;
    index: number;
  } | null>(null);
  const [editDraft, setEditDraft] = useState("");

  /* -------------------------
     Inline skill editing
  ------------------------- */

  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null,
  );

  /* -------------------------
     Resume
  ------------------------- */

  const [resumeStatus, setResumeStatus] = useState<
    "idle" | "parsing" | "done" | "error"
  >("idle");

  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sectionSuggestions, setSectionSuggestions] = useState<
    Record<SectionKey, string[]>
  >({
    education: [],
    experience: [],
    internships: [],
    certifications: [],
    hackathons: [],
    projects: [],
    interests: [],
  });

  /* -------------------------
     Token
  ------------------------- */

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* =========================================================
     Load Profile
  ========================================================= */

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get("/streak/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get("/skills"),
    ])
      .then(([userRes, streakRes, skillsRes]) => {
        setName(userRes.data.name || "");
        setEmail(userRes.data.email || "");

        setProfile({
          ...EMPTY_PROFILE,
          ...userRes.data.profile,
        });

        setBadges(streakRes.data.badges || []);

        setStreak(streakRes.data.streak || null);

        setAllSkills(skillsRes.data);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, router]);

  /* =========================================================
     Update text field
  ========================================================= */

  const setField = (key: ProfileTextKey, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================================================
     Name editing
  ========================================================= */

  const startEditName = () => {
    setNameDraft(name);
    setEditingName(true);
  };

  const cancelEditName = () => {
    setEditingName(false);
    setNameDraft("");
  };

  const commitEditName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === name) {
      setEditingName(false);
      return;
    }

    setNameSaving(true);
    try {
      await api.put(
        "/users/me/profile",
        { name: trimmed, profile },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setName(trimmed);
      setEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
    } finally {
      setNameSaving(false);
    }
  };

  /* =========================================================
     Skills
  ========================================================= */

  const addSkill = (skillId: string) => {
    if (!skillId || profile.skills.includes(skillId)) {
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skillId],
    }));
  };

  const removeSkill = (skillId: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillId),
    }));
  };

  const replaceSkill = (oldSkillId: string, newSkillId: string) => {
    if (!newSkillId || newSkillId === oldSkillId) {
      setEditingSkillIndex(null);
      return;
    }
    setProfile((prev) => {
      if (prev.skills.includes(newSkillId)) {
        // avoid duplicate: just drop the old one
        return { ...prev, skills: prev.skills.filter((s) => s !== oldSkillId) };
      }
      return {
        ...prev,
        skills: prev.skills.map((s) => (s === oldSkillId ? newSkillId : s)),
      };
    });
    setEditingSkillIndex(null);
  };

  /* =========================================================
     Add items
  ========================================================= */

  const addItem = (key: ListKey) => {
    const value = inputs[key]?.trim();

    if (!value) return;

    setProfile((prev) => ({
      ...prev,
      [key]: [...(prev[key] as string[]), value],
    }));

    setInputs((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  /* =========================================================
     Edit item (in place)
  ========================================================= */

  const editItem = (key: ListKey, index: number, newValue: string) => {
    setProfile((prev) => {
      const updated = [...(prev[key] as string[])];
      updated[index] = newValue;
      return { ...prev, [key]: updated };
    });
  };

  const startEdit = (key: ListKey, index: number, currentValue: string) => {
    setEditingItem({ key, index });
    setEditDraft(currentValue);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditDraft("");
  };

  const commitEdit = () => {
    if (!editingItem) return;
    const trimmed = editDraft.trim();
    if (trimmed) {
      editItem(editingItem.key, editingItem.index, trimmed);
    }
    setEditingItem(null);
    setEditDraft("");
  };

  /* =========================================================
     Remove item
  ========================================================= */

  const removeItem = (key: ListKey, index: number) => {
    setProfile((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((_, i) => i !== index),
    }));

    // if the removed item was mid-edit, clear editing state
    setEditingItem((prev) =>
      prev && prev.key === key && prev.index === index ? null : prev,
    );
  };

  /* =========================================================
     Resume Upload
  ========================================================= */

  const handleResumeUpload = async (file: File) => {
    setResumeStatus("parsing");

    try {
      const text = await extractTextFromFile(file);

      let matched = matchSkillsInText(text, allSkills);

      // Call AI endpoint to parse resume with Gemini
      if (token) {
        try {
          const aiRes = await api.post(
            "/ai/extract-resume-skills",
            {
              resumeText: text,
              availableSkills: allSkills,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (aiRes.data && Array.isArray(aiRes.data.extractedSkills)) {
            const aiSkills: string[] = aiRes.data.extractedSkills;
            const mapped = aiSkills.map((name) => {
              const found = allSkills.find(
                (s) =>
                  s.name.toLowerCase() === name.toLowerCase() ||
                  s.skillId.toLowerCase() === name.toLowerCase(),
              );
              return found ? found.skillId : name;
            });
            matched = Array.from(new Set([...matched, ...mapped]));
          }
        } catch (aiErr) {
          console.error("AI skill extraction fallback:", aiErr);
        }
      }

      const filtered = matched.filter((id) => !profile.skills.includes(id));
      setResumeSuggestions(filtered);

      const sections = parseResumeSections(text);
      // filter out anything already present in the profile
      (Object.keys(sections) as SectionKey[]).forEach((key) => {
        sections[key] = sections[key].filter(
          (item) => !profile[key].includes(item),
        );
      });
      setSectionSuggestions(sections);

      setResumeStatus("done");
    } catch (err) {
      console.error(err);
      setResumeStatus("error");
    }
  };

  const acceptSectionSuggestion = (key: SectionKey, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: [...(prev[key] as string[]), value],
    }));
    setSectionSuggestions((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }));
  };

  const acceptAllInSection = (key: SectionKey) => {
    setProfile((prev) => ({
      ...prev,
      [key]: [...(prev[key] as string[]), ...sectionSuggestions[key]],
    }));
    setSectionSuggestions((prev) => ({ ...prev, [key]: [] }));
  };

  /* =========================================================
     Accept Resume Skill
  ========================================================= */

  const acceptSuggestion = (skillId: string) => {
    addSkill(skillId);

    setResumeSuggestions((prev) => prev.filter((s) => s !== skillId));
  };

  const acceptAllSuggestions = () => {
    setProfile((prev) => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, ...resumeSuggestions])),
    }));
    setResumeSuggestions([]);
  };

  /* =========================================================
     Save Profile
  ========================================================= */

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");

    try {
      await api.put(
        "/users/me/profile",
        { name, profile },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSaveMsg("Profile saved successfully.");
    } catch {
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);

      setTimeout(() => {
        setSaveMsg("");
      }, 3000);
    }
  };

  /* =========================================================
     Logout
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  /* =========================================================
     Skill Name
  ========================================================= */

  const skillName = (id: string) =>
    allSkills.find((s) => s.skillId === id)?.name || id;

  /* =========================================================
     Completion
  ========================================================= */

  const sectionKeys: ListKey[] = [
    "skills",
    "education",
    "experience",
    "internships",
    "certifications",
    "hackathons",
    "projects",
    "interests",
  ];

  const filledCount = sectionKeys.filter(
    (key) => (profile[key] as string[]).length > 0,
  ).length;

  const completionPercent = Math.round(
    (filledCount / sectionKeys.length) * 100,
  );

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />

          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </main>
    );
  }

  /* =========================================================
     Visible Skills
  ========================================================= */

  const visibleSkills = showAllSkills
    ? profile.skills
    : profile.skills.slice(0, 5);

  const extraSkillCount = profile.skills.length - visibleSkills.length;

  /* =========================================================
     Current Tab
  ========================================================= */

  const currentTab = TAB_CONFIG.find((tab) => tab.key === activeTab);

  /* =========================================================
     Render
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#050816] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto pb-28">
        {/* =====================================================
    PROFILE HEADER
===================================================== */}

        <section className="relative overflow-hidden bg-[#0B1120] border border-slate-800/80 rounded-2xl mb-5">
          {/* Cover */}
          <div className="h-6 bg-[#0B1120]">
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%)]" />

            {/* Decorative glow */}
            <div className="absolute -top-16 right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          {/* Header Content */}
          <div className="px-6 sm:px-7 py-8">
            {/* Identity + Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Identity */}
              <div className="flex items-end gap-4 -mt-10">
                {/* Avatar */}
                <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 border-4 border-[#0B1120] flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-black/30">
                  {initials(name)}
                </div>

                {/* Name */}
                <div className="pb-1 min-w-0">
                  <p className="text-xs text-blue-400 font-medium mb-1">
                    Career Profile
                  </p>

                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEditName();
                          if (e.key === "Escape") cancelEditName();
                        }}
                        className="text-2xl font-bold bg-transparent text-white outline-none border-b border-blue-500/60 min-w-0"
                      />
                      <button
                        onClick={commitEditName}
                        disabled={nameSaving}
                        className="text-emerald-400 hover:text-emerald-300 shrink-0"
                        aria-label="Save name"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEditName}
                        className="text-slate-500 hover:text-red-400 shrink-0"
                        aria-label="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h1 className="text-2xl font-bold text-white whitespace-nowrap">
                        {name || "Your Name"}
                      </h1>
                      <button
                        onClick={startEditName}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400 transition"
                        aria-label="Edit name"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <p className="text-sm text-slate-400 mt-1">{email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 lg:pr-2">
                {/* Projects */}
                <div className="text-center min-w-[55px]">
                  <p className="text-xl font-bold text-white">
                    {profile.projects.length}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">Projects</p>
                </div>

                <div className="w-px h-8 bg-slate-800" />

                {/* Badges */}
                <div className="text-center min-w-[55px]">
                  <p className="text-xl font-bold text-white">
                    {badges.length}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">Badges</p>
                </div>

                <div className="w-px h-8 bg-slate-800" />

                {/* Streak */}
                <div className="text-center min-w-[55px]">
                  <p className="text-xl font-bold text-white">
                    {streak?.count ?? 0}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">Streak</p>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              {/* Education */}
              <div className="group flex items-center gap-3 bg-[#060B16] border border-slate-800 rounded-xl px-4 py-3 hover:border-blue-500/30 transition">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Education</p>

                  <p className="text-sm font-medium text-slate-200 truncate">
                    {profile.education[0] || "Not added yet"}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="group flex items-center gap-3 bg-[#060B16] border border-slate-800 rounded-xl px-4 py-3 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <BriefcaseBusiness className="w-4 h-4 text-purple-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Experience</p>

                  <p className="text-sm font-medium text-slate-200 truncate">
                    {profile.experience[0] ||
                      profile.internships[0] ||
                      "Not added yet"}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="group flex items-center gap-3 bg-[#060B16] border border-slate-800 rounded-xl px-4 py-3 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Location</p>

                  <p className="text-sm font-medium text-slate-200 truncate">
                    {profile.location || "Not added yet"}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(profile.github || profile.linkedin || profile.instagram) && (
              <div className="flex items-center gap-2 mt-5">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="w-9 h-9 rounded-lg border border-slate-800 bg-[#060B16] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 hover:bg-[#0B1120] transition"
                  >
                    <Code2 className="w-4 h-4" />
                  </a>
                )}

                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-lg border border-slate-800 bg-[#060B16] flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-[#0B1120] transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-lg border border-slate-800 bg-[#060B16] flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-pink-500/40 hover:bg-[#0B1120] transition"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            PROFILE COMPLETION
        ===================================================== */}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />

              <span className="text-sm font-medium text-slate-300">
                Profile completion
              </span>
            </div>

            <span className="text-sm font-semibold text-emerald-400">
              {completionPercent}%
            </span>
          </div>

          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{
                width: `${completionPercent}%`,
              }}
            />
          </div>

          {completionPercent < 100 && (
            <p className="text-xs text-slate-600 mt-2">
              Add more information to make your career profile stronger.
            </p>
          )}
        </section>

        {/* =====================================================
            ABOUT + QUICK PROFILE
        ===================================================== */}

        <section className="grid lg:grid-cols-[1fr_300px] gap-5 mb-5">
          {/* About */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white">
                  About {name.split(" ")[0] || "you"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Tell others a little about yourself
                </p>
              </div>

              <button
                onClick={() => setEditingAbout((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition"
              >
                <Pencil className="w-3.5 h-3.5" />

                {editingAbout ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingAbout ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    Location
                  </label>

                  <input
                    value={profile.location}
                    onChange={(e) => setField("location", e.target.value)}
                    placeholder="e.g. Goa, India"
                    className="w-full border border-slate-800 rounded-lg bg-[#060B16] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    Short bio
                  </label>

                  <textarea
                    value={profile.bio}
                    onChange={(e) => setField("bio", e.target.value)}
                    placeholder="Write a short bio about yourself..."
                    rows={4}
                    className="w-full border border-slate-800 rounded-lg bg-[#060B16] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    value={profile.github}
                    onChange={(e) => setField("github", e.target.value)}
                    placeholder="GitHub URL"
                    className="w-full border border-slate-800 rounded-lg bg-[#060B16] px-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60"
                  />

                  <input
                    value={profile.linkedin}
                    onChange={(e) => setField("linkedin", e.target.value)}
                    placeholder="LinkedIn URL"
                    className="w-full border border-slate-800 rounded-lg bg-[#060B16] px-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60"
                  />

                  <input
                    value={profile.instagram}
                    onChange={(e) => setField("instagram", e.target.value)}
                    placeholder="Instagram URL"
                    className="w-full border border-slate-800 rounded-lg bg-[#060B16] px-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60"
                  />
                </div>

                <button
                  onClick={() => setEditingAbout(false)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {profile.bio || "Add a short bio so others know who you are."}
                </p>

                {!profile.bio && (
                  <button
                    onClick={() => setEditingAbout(true)}
                    className="mt-4 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Add your bio →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Snapshot */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-blue-400" />

              <div>
                <h2 className="font-semibold text-white text-sm">
                  Profile Snapshot
                </h2>

                <p className="text-[11px] text-slate-500">
                  Your current profile
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-slate-500 mb-1">Name</p>

                <p className="text-sm text-slate-200">{name || "Not added"}</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 mb-1">Email</p>

                <p className="text-sm text-slate-200 truncate">
                  {email || "Not added"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 mb-1">Education</p>

                <p className="text-sm text-slate-200">
                  {profile.education[0] || "Not added"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 mb-1">Experience</p>

                <p className="text-sm text-slate-200">
                  {profile.experience[0] ||
                    profile.internships[0] ||
                    "Fresher / Not added"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RESUME
        ===================================================== */}

        <section className="bg-[#0B1120] border border-slate-800 rounded-xl px-6 py-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">Resume</h2>

                <p className="text-xs text-slate-500 mt-1">
                  Generate a resume from your profile or import an existing one.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-slate-700 hover:border-blue-500/50 bg-[#060B16] text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                <Upload className="w-4 h-4" />
                Import Resume
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleResumeUpload(e.target.files[0])
                }
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            RESUME STATUS
        ===================================================== */}

        {resumeStatus === "parsing" && (
          <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl px-5 py-4 mb-5">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />

            <p className="text-sm text-blue-300">Reading your resume...</p>
          </div>
        )}

        {resumeStatus === "error" && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4 mb-5">
            <p className="text-sm text-red-400">
              Couldn&apos;t read that file. Try a different PDF/DOCX.
            </p>
          </div>
        )}

        {resumeStatus === "done" && (
          <>
            <section className="bg-[#0B1120] border border-slate-800 rounded-xl px-6 py-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Skills from your resume
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tap to add to your profile
                    </p>
                  </div>
                </div>

                {resumeSuggestions.length > 0 && (
                  <button
                    onClick={acceptAllSuggestions}
                    className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Add All Skills ({resumeSuggestions.length})
                  </button>
                )}
              </div>

              {resumeSuggestions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No matching skills found in this resume.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resumeSuggestions.map((id) => (
                    <button
                      key={id}
                      onClick={() => acceptSuggestion(id)}
                      className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {skillName(id)}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {(Object.keys(sectionSuggestions) as SectionKey[])
              .filter((key) => sectionSuggestions[key].length > 0)
              .map((key) => {
                const tab = TAB_CONFIG.find((t) => t.key === key);
                return (
                  <section
                    key={key}
                    className="bg-[#0B1120] border border-slate-800 rounded-xl px-6 py-5 mb-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {tab?.icon}
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {tab?.label} from your resume
                          </h3>
                          <p className="text-xs text-slate-500">
                            Review and add the lines that look right
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => acceptAllInSection(key)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Add all
                      </button>
                    </div>

                    <div className="space-y-2">
                      {sectionSuggestions[key].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between gap-3 bg-[#060B16] border border-slate-800 rounded-lg px-4 py-2.5"
                        >
                          <p className="text-sm text-slate-300">{item}</p>
                          <button
                            onClick={() => acceptSectionSuggestion(key, item)}
                            className="shrink-0 flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md hover:bg-blue-500/20 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
          </>
        )}

        {/* =====================================================
            SKILLS
        ===================================================== */}

        <section className="bg-[#0B1120] border border-slate-800 rounded-xl px-6 py-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">Acquired Skills</h2>

                <p className="text-xs text-slate-500 mt-1">
                  Technologies and skills you&apos;ve learned
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingSkills((v) => !v);
                setEditingSkillIndex(null);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition"
            >
              <Pencil className="w-3.5 h-3.5" />

              {editingSkills ? "Done" : "Edit"}
            </button>
          </div>

          {/* Add skill */}
          {editingSkills && (
            <div className="flex gap-2 mb-5">
              <select
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 border border-slate-800 rounded-lg bg-[#060B16] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
              >
                <option value="">Add a skill...</option>

                {allSkills
                  .filter((s) => !profile.skills.includes(s.skillId))
                  .map((s) => (
                    <option key={s.skillId} value={s.skillId}>
                      {s.name}
                    </option>
                  ))}
              </select>

              <button
                onClick={() => {
                  addSkill(skillInput);

                  setSkillInput("");
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}

          {/* Skills */}
          {profile.skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-800 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5 text-slate-600" />
              </div>

              <p className="text-sm text-slate-500">No skills added yet</p>

              <button
                onClick={() => setEditingSkills(true)}
                className="text-xs text-blue-400 hover:text-blue-300 mt-2"
              >
                Add your first skill →
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visibleSkills.map((id, index) => {
                const isEditingThisSkill = editingSkillIndex === index;

                if (editingSkills && isEditingThisSkill) {
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-2 bg-[#060B16] border border-blue-500/60 rounded-lg px-2 py-1.5"
                    >
                      <select
                        autoFocus
                        defaultValue={id}
                        onChange={(e) => replaceSkill(id, e.target.value)}
                        onBlur={() => setEditingSkillIndex(null)}
                        className="bg-transparent text-sm text-white outline-none"
                      >
                        <option value={id}>{skillName(id)}</option>
                        {allSkills
                          .filter(
                            (s) =>
                              !profile.skills.includes(s.skillId) ||
                              s.skillId === id,
                          )
                          .map((s) => (
                            <option key={s.skillId} value={s.skillId}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => setEditingSkillIndex(null)}
                        className="text-slate-500 hover:text-red-400"
                        aria-label="Cancel edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                }

                return (
                  <span
                    key={id}
                    className="group flex items-center gap-2 bg-[#060B16] border border-slate-800 text-slate-300 text-sm px-3 py-2 rounded-lg hover:border-slate-700 transition"
                  >
                    <span>{skillName(id)}</span>

                    {editingSkills && (
                      <>
                        <button
                          onClick={() => setEditingSkillIndex(index)}
                          className="text-slate-600 hover:text-blue-400 transition"
                          aria-label={`Edit ${skillName(id)}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeSkill(id)}
                          className="text-slate-600 hover:text-red-400 transition"
                          aria-label={`Remove ${skillName(id)}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </span>
                );
              })}

              {extraSkillCount > 0 && (
                <button
                  onClick={() => setShowAllSkills(true)}
                  className="flex items-center gap-1.5 border border-slate-800 text-slate-500 text-sm px-3 py-2 rounded-lg hover:text-white hover:border-slate-700 transition"
                >
                  <ChevronDown className="w-4 h-4" />
                  {extraSkillCount} more
                </button>
              )}

              {showAllSkills && profile.skills.length > 5 && (
                <button
                  onClick={() => setShowAllSkills(false)}
                  className="flex items-center gap-1.5 border border-slate-800 text-slate-500 text-sm px-3 py-2 rounded-lg hover:text-white hover:border-slate-700 transition"
                >
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </button>
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            BADGES
        ===================================================== */}

        <section className="bg-[#0B1120] border border-slate-800 rounded-xl px-6 py-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Badges</h2>

              <p className="text-xs text-slate-500 mt-1">
                Achievements earned through your progress
              </p>
            </div>
          </div>

          {badges.length === 0 ? (
            <div className="flex items-center gap-3 border border-dashed border-slate-800 rounded-xl px-4 py-4">
              <Award className="w-5 h-5 text-slate-600" />

              <div>
                <p className="text-sm text-slate-500">No badges yet</p>

                <p className="text-xs text-slate-600 mt-0.5">
                  Keep learning to unlock achievements.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-200">
                      {BADGE_NAMES[badge] || badge}
                    </p>

                    <p className="text-[11px] text-slate-600">Achievement</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            PROFILE INFORMATION TABS
        ===================================================== */}

        <section>
          {/* Tabs */}
          <div className="overflow-x-auto border-b border-slate-800 mb-5">
            <div className="flex min-w-max">
              {TAB_CONFIG.map(({ key, label, icon }) => {
                const count = (profile[key] as string[]).length;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setEditingItem(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === key
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {icon}

                    {label}

                    {count > 0 && (
                      <span className="text-[11px] opacity-60">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===================================================
              Active Tab
          =================================================== */}

          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  {currentTab?.icon}
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    {currentTab?.label}
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Add information to your profile
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-600">
                {(profile[activeTab] as string[]).length} added
              </span>
            </div>

            {/* Add item */}
            <div className="flex gap-2 mb-5">
              <input
                value={inputs[activeTab] || ""}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    [activeTab]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(activeTab);
                  }
                }}
                placeholder={currentTab?.placeholder}
                className="flex-1 border border-slate-800 rounded-lg bg-[#060B16] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition"
              />

              <button
                onClick={() => addItem(activeTab)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Empty state */}
            {(profile[activeTab] as string[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-800 rounded-xl">
                <div className="w-11 h-11 rounded-xl bg-slate-800/50 flex items-center justify-center mb-3">
                  {currentTab?.icon}
                </div>

                <p className="text-sm text-slate-500">Nothing added yet</p>

                <p className="text-xs text-slate-600 mt-1">
                  Add your first {currentTab?.label.toLowerCase()}.
                </p>
              </div>
            ) : (
              /* Items */
              <div className="space-y-2">
                {(profile[activeTab] as string[]).map((item, index) => {
                  const isEditing =
                    editingItem?.key === activeTab &&
                    editingItem?.index === index;

                  return (
                    <div
                      key={`${activeTab}-${index}`}
                      className="group flex items-center justify-between gap-4 bg-[#060B16] border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-500">
                          {currentTab?.icon}
                        </div>

                        {isEditing ? (
                          <input
                            autoFocus
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="flex-1 bg-transparent text-sm text-white outline-none border-b border-blue-500/60 pb-0.5 min-w-0"
                          />
                        ) : (
                          <p className="text-sm text-slate-300 wrap-break-word">
                            {item}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={commitEdit}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition"
                              aria-label="Save edit"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800 transition"
                              aria-label="Cancel edit"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(activeTab, index, item)}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition"
                              aria-label="Edit item"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(activeTab, index)}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"
                              aria-label="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =======================================================
          STICKY SAVE BAR
      ======================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <div className="flex items-center justify-between gap-4 bg-[#0B1120]/95 backdrop-blur-xl border border-slate-800 rounded-xl px-5 py-3 shadow-2xl shadow-black/30">
            {/* Save message */}
            <div className="flex items-center gap-2 min-w-0">
              {saveMsg && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}

              <span
                className={`text-sm truncate ${
                  saveMsg ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                {saveMsg || "Changes are saved when you click Save Profile."}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-lg px-4 py-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
