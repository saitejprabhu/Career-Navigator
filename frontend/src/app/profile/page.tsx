"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { extractTextFromFile } from "@/utils/resumeParser";
import { matchSkillsInText } from "@/utils/skillMatch";

const BADGE_NAMES: Record<string, string> = {
  "getting-started": "🌱 Getting Started",
  "consistent-learner": "📅 Consistent Learner",
  "dedicated-learner": "💪 Dedicated Learner",
  unstoppable: "🚀 Unstoppable",
};

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

const TAB_CONFIG: {
  key: keyof ProfileData;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "education",
    label: "Education",
    placeholder: "e.g. B.Tech IT, Goa College of Engineering",
  },
  {
    key: "experience",
    label: "Work Experience",
    placeholder: "e.g. Frontend Intern at XYZ Corp",
  },
  {
    key: "internships",
    label: "Internships",
    placeholder: "e.g. Summer Intern at ABC Ltd",
  },
  {
    key: "certifications",
    label: "Courses & Certifications",
    placeholder: "e.g. AWS Cloud Practitioner",
  },
  {
    key: "hackathons",
    label: "Hackathons",
    placeholder: "e.g. Smart India Hackathon 2026 — Finalist",
  },
  {
    key: "projects",
    label: "Projects",
    placeholder: "e.g. Portfolio website with Next.js",
  },
  {
    key: "interests",
    label: "Interests",
    placeholder: "e.g. Web development, AI",
  },
];

interface SkillRef {
  skillId: string;
  name: string;
}

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

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState("");
  const [allSkills, setAllSkills] = useState<SkillRef[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [streak, setStreak] = useState<{
    count: number;
    freezesAvailable: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [editingAbout, setEditingAbout] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof ProfileData>("education");

  const [resumeStatus, setResumeStatus] = useState<
    "idle" | "parsing" | "done" | "error"
  >("idle");
  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/streak/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/skills"),
    ])
      .then(([userRes, streakRes, skillsRes]) => {
        setName(userRes.data.name || "");
        setEmail(userRes.data.email || "");
        setProfile({ ...EMPTY_PROFILE, ...userRes.data.profile });
        setBadges(streakRes.data.badges || []);
        setStreak(streakRes.data.streak || null);
        setAllSkills(skillsRes.data);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [token, router]);

  const setField = (key: keyof ProfileData, value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const addSkill = (skillId: string) => {
    if (!skillId || profile.skills.includes(skillId)) return;
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, skillId] }));
  };
  const removeSkill = (skillId: string) =>
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillId),
    }));

  const addItem = (key: keyof ProfileData) => {
    const value = inputs[key]?.trim();
    if (!value) return;
    setProfile((prev) => ({
      ...prev,
      [key]: [...(prev[key] as string[]), value],
    }));
    setInputs((prev) => ({ ...prev, [key]: "" }));
  };
  const removeItem = (key: keyof ProfileData, index: number) =>
    setProfile((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((_, i) => i !== index),
    }));

  const handleResumeUpload = async (file: File) => {
    setResumeStatus("parsing");
    try {
      const text = await extractTextFromFile(file);
      const matched = matchSkillsInText(text, allSkills).filter(
        (id) => !profile.skills.includes(id),
      );
      setResumeSuggestions(matched);
      setResumeStatus("done");
    } catch {
      setResumeStatus("error");
    }
  };

  const acceptSuggestion = (skillId: string) => {
    addSkill(skillId);
    setResumeSuggestions((prev) => prev.filter((s) => s !== skillId));
  };

  const generateResumeText = () => {
    const skillNames = profile.skills.map(
      (id) => allSkills.find((s) => s.skillId === id)?.name || id,
    );
    const lines = [
      `${name}`,
      email,
      profile.location,
      "",
      profile.bio,
      "",
      "SKILLS",
      ...skillNames.map((s) => `- ${s}`),
      "",
      "EDUCATION",
      ...profile.education.map((e) => `- ${e}`),
      "",
      "EXPERIENCE",
      ...profile.experience.map((e) => `- ${e}`),
      "",
      "INTERNSHIPS",
      ...profile.internships.map((e) => `- ${e}`),
      "",
      "COURSES & CERTIFICATIONS",
      ...profile.certifications.map((e) => `- ${e}`),
      "",
      "HACKATHONS",
      ...profile.hackathons.map((e) => `- ${e}`),
      "",
      "PROJECTS",
      ...profile.projects.map((e) => `- ${e}`),
      "",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "resume"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await api.put("/users/me/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaveMsg("Profile saved successfully.");
    } catch {
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const skillName = (id: string) =>
    allSkills.find((s) => s.skillId === id)?.name || id;

  const sectionKeys: (keyof ProfileData)[] = [
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
    (k) => (profile[k] as string[]).length > 0,
  ).length;
  const completionPercent = Math.round(
    (filledCount / sectionKeys.length) * 100,
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </main>
    );
  }

  const visibleSkills = showAllSkills
    ? profile.skills
    : profile.skills.slice(0, 5);
  const extraSkillCount = profile.skills.length - visibleSkills.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Top: About card + Cover card */}
        <div className="grid md:grid-cols-[280px_1fr] gap-5 mb-2">
          {/* About */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">About {name.split(" ")[0]}</h2>
              <button
                onClick={() => setEditingAbout((v) => !v)}
                className="text-gray-500 hover:text-blue-400 text-sm"
              >
                ✎
              </button>
            </div>

            {editingAbout ? (
              <div className="space-y-3">
                <input
                  value={profile.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="Location, e.g. Goa, India"
                  className="w-full border border-gray-700 rounded-lg bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <textarea
                  value={profile.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Write a short bio..."
                  rows={4}
                  className="w-full border border-gray-700 rounded-lg bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                />
                <input
                  value={profile.github}
                  onChange={(e) => setField("github", e.target.value)}
                  placeholder="GitHub URL"
                  className="w-full border border-gray-700 rounded-lg bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  value={profile.linkedin}
                  onChange={(e) => setField("linkedin", e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full border border-gray-700 rounded-lg bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  value={profile.instagram}
                  onChange={(e) => setField("instagram", e.target.value)}
                  placeholder="Instagram URL"
                  className="w-full border border-gray-700 rounded-lg bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setEditingAbout(false)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-3 text-lg">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer">
                      🐙
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer">
                      💼
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📷
                    </a>
                  )}
                  {!profile.github &&
                    !profile.linkedin &&
                    !profile.instagram && (
                      <span className="text-xs text-gray-600">
                        No links added
                      </span>
                    )}
                </div>
                {profile.location && (
                  <p className="text-sm text-gray-400 mb-3">
                    📍 {profile.location}
                  </p>
                )}
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {profile.bio || "Add a short bio so others know who you are."}
                </p>
              </>
            )}
          </div>

          {/* Cover / identity card */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800">
            <div className="h-28 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700" />
            <div className="bg-gray-900/80 px-6 pt-0 pb-5 flex items-end justify-between -mt-10">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center text-xl font-bold">
                  {initials(name)}
                </div>
                <div className="pb-1">
                  <p className="font-semibold text-lg">{name}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
              </div>
              <div className="flex gap-6 text-center pb-1">
                <div>
                  <p className="font-semibold">{profile.projects.length}</p>
                  <p className="text-xs text-gray-500">Projects</p>
                </div>
                <div>
                  <p className="font-semibold">{badges.length}</p>
                  <p className="text-xs text-gray-500">Badges</p>
                </div>
                <div>
                  <p className="font-semibold">{streak?.count ?? 0}</p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Profile Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Resume & profile action row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-4 mb-5">
          <div>
            <h3 className="font-semibold text-sm">Resume & Profile</h3>
            <p className="text-xs text-gray-500">
              Build a resume from your profile, or pull in skills by uploading a
              file.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateResumeText}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Generate Resume
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-gray-700 hover:border-blue-600 text-gray-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Import from Resume
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

        {resumeStatus === "parsing" && (
          <p className="text-xs text-gray-500 mb-4">Reading your resume...</p>
        )}
        {resumeStatus === "error" && (
          <p className="text-xs text-red-400 mb-4">
            Couldn&apos;t read that file. Try a different PDF/DOCX.
          </p>
        )}
        {resumeStatus === "done" && resumeSuggestions.length > 0 && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-4 mb-5">
            <p className="text-xs text-gray-400 mb-2">
              Found these skills in your resume — tap to add:
            </p>
            <div className="flex flex-wrap gap-2">
              {resumeSuggestions.map((id) => (
                <button
                  key={id}
                  onClick={() => acceptSuggestion(id)}
                  className="text-xs bg-blue-500/10 text-blue-400 border border-blue-800/50 px-3 py-1 rounded-full hover:bg-blue-500/20"
                >
                  + {skillName(id)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Acquired Skills */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Acquired Skills</h2>
            <button
              onClick={() => setEditingSkills((v) => !v)}
              className="text-gray-500 hover:text-blue-400 text-sm"
            >
              ✎
            </button>
          </div>

          {editingSkills && (
            <div className="flex gap-2 mb-4">
              <select
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 border border-gray-700 rounded-lg bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 rounded-lg"
              >
                Add
              </button>
            </div>
          )}

          {profile.skills.length === 0 ? (
            <p className="text-gray-600 text-sm">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visibleSkills.map((id) => (
                <span
                  key={id}
                  className="flex items-center gap-2 border border-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-full"
                >
                  {skillName(id)}
                  {editingSkills && (
                    <button
                      onClick={() => removeSkill(id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
              {extraSkillCount > 0 && (
                <button
                  onClick={() => setShowAllSkills(true)}
                  className="border border-gray-700 text-gray-400 text-sm px-3 py-1.5 rounded-full hover:text-white"
                >
                  {extraSkillCount} More Skills
                </button>
              )}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-5 mb-5">
          <h2 className="font-semibold mb-3">Badges</h2>
          {badges.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No badges yet — keep learning!
            </p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {badges.map((b) => (
                <span
                  key={b}
                  className="bg-yellow-500/10 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs"
                >
                  {BADGE_NAMES[b] || b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {TAB_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap text-sm px-4 py-2 rounded-full border transition-colors ${
                activeTab === key
                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                  : "border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {label}
              {(profile[key] as string[]).length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({(profile[key] as string[]).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        {TAB_CONFIG.filter((t) => t.key === activeTab).map(
          ({ key, placeholder }) => (
            <div
              key={key}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-5 mb-8"
            >
              <div className="flex gap-2 mb-3">
                <input
                  value={inputs[key] || ""}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addItem(key))
                  }
                  placeholder={placeholder}
                  className="flex-1 border border-gray-700 rounded-lg bg-gray-950 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => addItem(key)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 rounded-lg"
                >
                  + Add
                </button>
              </div>
              {(profile[key] as string[]).length === 0 ? (
                <p className="text-gray-600 text-sm">Nothing added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profile[key] as string[]).map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 bg-gray-800 text-gray-200 text-sm px-3 py-1.5 rounded-full"
                    >
                      {item}
                      <button
                        onClick={() => removeItem(key, i)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ),
        )}

        {/* Save bar */}
        <div className="sticky bottom-4 flex items-center justify-between bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl px-6 py-4">
          <span className="text-sm text-gray-400">{saveMsg}</span>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 rounded-lg px-4 py-2 transition-colors"
            >
              Log Out
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
