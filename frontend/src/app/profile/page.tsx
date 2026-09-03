// frontend/src/app/profile/page.tsx
"use client";
import { useState } from "react";
import { useCareerStore } from "@/store/useCareerStore";

export default function ProfilePage() {
  const [skillInput, setSkillInput] = useState("");
  const { profile, setProfile } = useCareerStore();

  const addSkill = () => {
    if (skillInput.trim()) {
      setProfile({
        skills: [...profile.skills, skillInput.trim().toLowerCase()],
      });
      setSkillInput("");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Build Your Profile</h1>
      <input
        value={skillInput}
        onChange={(e) => setSkillInput(e.target.value)}
        placeholder="Add a skill (e.g. HTML)"
        className="border p-2 rounded mr-2"
      />
      <button
        onClick={addSkill}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add
      </button>
      <ul className="mt-4">
        {profile.skills.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
