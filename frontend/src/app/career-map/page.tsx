"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import api from "@/lib/api";

interface Skill {
  skillId: string;
  name: string;
  prerequisites: string[];
}

interface Role {
  roleId: string;
  name: string;
  requiredSkills: string[];
}

interface SkillStatus {
  status: string;
  lastUpdated: string;
}

const STATUS_COLOR: Record<string, string> = {
  not_started: "#374151", // grey
  claimed: "#f59e0b", // amber
  practiced: "#3b82f6", // blue
  mastered: "#22c55e", // green
};

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  claimed: "Claimed",
  practiced: "Practiced",
  mastered: "Mastered",
};

export default function CareerMapPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [skillStatus, setSkillStatus] = useState<Record<string, SkillStatus>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [marking, setMarking] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/skills"),
      api.get("/roles"),
      api.get("/progress/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([skillsRes, rolesRes, progressRes]) => {
        setSkills(skillsRes.data);
        setRoles(rolesRes.data);
        setSkillStatus(progressRes.data);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [token, router]);

  const markAsLearned = async (skillId: string) => {
    setMarking(true);
    try {
      await api.post(
        "/progress/mark-learned",
        { skillId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSkillStatus((prev) => ({
        ...prev,
        [skillId]: { status: "claimed", lastUpdated: new Date().toISOString() },
      }));
    } catch (err) {
      console.error("Failed to mark as learned:", err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading career map...</p>
      </main>
    );
  }

  // Layout: skills on the left in dependency order (roughly), roles on the right
  const skillNodes: Node[] = skills.map((skill, index) => {
    const status = skillStatus[skill.skillId]?.status || "not_started";
    return {
      id: `skill-${skill.skillId}`,
      data: { label: skill.name },
      position: { x: (index % 4) * 180, y: Math.floor(index / 4) * 110 },
      style: {
        background: "#0d1220",
        color: "#e5e7eb",
        border: `2px solid ${STATUS_COLOR[status]}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        cursor: "pointer",
      },
    };
  });

  const roleStartX = Math.ceil(skills.length / 4) * 180 + 220;
  const roleNodes: Node[] = roles.map((role, index) => {
    const matched = role.requiredSkills.filter(
      (s) => skillStatus[s]?.status,
    ).length;
    const matchPercent = Math.round(
      (matched / role.requiredSkills.length) * 100,
    );
    return {
      id: `role-${role.roleId}`,
      data: { label: `${role.name}\n${matchPercent}% match` },
      position: { x: roleStartX, y: index * 140 },
      style: {
        background: "#0d1220",
        color: "#e5e7eb",
        border: "2px solid #6366f1",
        borderRadius: 12,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "pre-line",
        textAlign: "center",
      },
    };
  });

  const skillEdges: Edge[] = skills.flatMap((skill) =>
    skill.prerequisites.map((prereq) => ({
      id: `edge-${prereq}-${skill.skillId}`,
      source: `skill-${prereq}`,
      target: `skill-${skill.skillId}`,
      style: { stroke: "#374151" },
    })),
  );

  const roleEdges: Edge[] = roles.flatMap((role) =>
    role.requiredSkills.map((skillId) => ({
      id: `edge-${skillId}-${role.roleId}`,
      source: `skill-${skillId}`,
      target: `role-${role.roleId}`,
      style: { stroke: "#4338ca", strokeDasharray: "4 3" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#4338ca" },
    })),
  );

  const handleNodeClick = (_: unknown, node: Node) => {
    if (!node.id.startsWith("skill-")) return;
    const skillId = node.id.replace("skill-", "");
    const skill = skills.find((s) => s.skillId === skillId) || null;
    setSelectedSkill(skill);
  };

  return (
    <main className="bg-gradient-to-b from-black via-gray-950 to-black text-white min-h-screen">
      <div className="px-6 py-5">
        <h1 className="text-2xl font-bold mb-1">Your Career Map</h1>
        <p className="text-sm text-gray-500">
          Skills connect to the roles they unlock. Click a skill to see details.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-6 pb-4 text-xs text-gray-400">
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full inline-block"
              style={{ background: STATUS_COLOR[key] }}
            />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full inline-block border-2 border-indigo-500" />
          Career role
        </div>
      </div>

      <div className="relative" style={{ height: "65vh" }}>
        <ReactFlow
          nodes={[...skillNodes, ...roleNodes]}
          edges={[...skillEdges, ...roleEdges]}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background color="#1f2937" />
          <Controls />
        </ReactFlow>
      </div>

      {/* Skill detail side panel */}
      {selectedSkill && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-950 border-l border-gray-800 shadow-2xl z-20 p-6 overflow-y-auto">
          <button
            onClick={() => setSelectedSkill(null)}
            className="text-gray-500 hover:text-white text-sm mb-4"
          >
            ✕ Close
          </button>

          <h2 className="text-xl font-bold mb-1">{selectedSkill.name}</h2>
          {(() => {
            const status =
              skillStatus[selectedSkill.skillId]?.status || "not_started";
            return (
              <span
                className="inline-block text-xs px-2.5 py-1 rounded-full mb-4"
                style={{
                  background: `${STATUS_COLOR[status]}22`,
                  color: STATUS_COLOR[status],
                  border: `1px solid ${STATUS_COLOR[status]}55`,
                }}
              >
                {STATUS_LABEL[status]}
              </span>
            );
          })()}

          {selectedSkill.prerequisites.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-1.5">Prerequisites</p>
              <div className="flex flex-wrap gap-2">
                {selectedSkill.prerequisites.map((pId) => {
                  const pSkill = skills.find((s) => s.skillId === pId);
                  const pStatus = skillStatus[pId]?.status || "not_started";
                  return (
                    <span
                      key={pId}
                      className="text-xs px-2.5 py-1 rounded-full border"
                      style={{
                        borderColor: STATUS_COLOR[pStatus],
                        color: STATUS_COLOR[pStatus],
                      }}
                    >
                      {pSkill?.name || pId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-1.5">Required for</p>
            <div className="flex flex-wrap gap-2">
              {roles
                .filter((r) => r.requiredSkills.includes(selectedSkill.skillId))
                .map((r) => (
                  <span
                    key={r.roleId}
                    className="text-xs px-2.5 py-1 rounded-full border border-indigo-700 text-indigo-400"
                  >
                    {r.name}
                  </span>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            {!skillStatus[selectedSkill.skillId] && (
              <button
                onClick={() => markAsLearned(selectedSkill.skillId)}
                disabled={marking}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {marking ? "Marking..." : "Mark as Learned"}
              </button>
            )}
            <Link
              href={`/skill/${selectedSkill.skillId}`}
              className="text-center border border-gray-700 hover:border-blue-500 text-gray-200 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              View Project →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
