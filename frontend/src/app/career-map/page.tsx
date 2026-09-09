"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Code2,
  Lock,
  Map,
  Play,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import api from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Role {
  roleId: string;
  name: string;
  requiredSkills: string[];
}

interface Skill {
  skillId: string;
  name: string;
  prerequisites?: string[];
  description?: string;
}

interface SkillProgress {
  status: string;
  lastUpdated: string;
}

interface SkillNodeData {
  skill: Skill;
  status: string;
  locked: boolean;
  onClick: (skill: Skill) => void;
}

/* =========================================================
   SKILL NODE
========================================================= */

function SkillNode({ data }: NodeProps<SkillNodeData>) {
  const { skill, status, locked, onClick } = data;

  const mastered = status === "mastered";
  const practiced = status === "practiced";
  const claimed = status === "claimed";

  return (
    <button
      onClick={() => onClick(skill)}
      disabled={locked}
      className={`
        relative w-[190px] rounded-xl border
        text-left transition-all duration-200
        ${
          mastered
            ? "border-emerald-500/50 bg-[#071812] shadow-lg shadow-emerald-500/5"
            : practiced
              ? "border-blue-500/50 bg-[#081525] shadow-lg shadow-blue-500/5"
              : claimed
                ? "border-yellow-500/40 bg-[#171405]"
                : locked
                  ? "border-slate-800 bg-[#080C15] opacity-60"
                  : "border-slate-700 bg-[#0B1120] hover:border-blue-500/50 hover:bg-[#0D1526]"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-[#050816] !bg-slate-600"
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg border
              ${
                mastered
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : practiced
                    ? "border-blue-500/20 bg-blue-500/10"
                    : claimed
                      ? "border-yellow-500/20 bg-yellow-500/10"
                      : "border-slate-800 bg-[#060B16]"
              }
            `}
          >
            {mastered ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : locked ? (
              <Lock className="h-4 w-4 text-slate-600" />
            ) : practiced ? (
              <Play className="h-4 w-4 text-blue-400" />
            ) : claimed ? (
              <Clock3 className="h-4 w-4 text-yellow-400" />
            ) : (
              <Code2 className="h-4 w-4 text-slate-500" />
            )}
          </div>

          {mastered && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
              DONE
            </span>
          )}

          {practiced && (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-medium text-blue-400">
              PRACTICED
            </span>
          )}

          {claimed && (
            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[9px] font-medium text-yellow-400">
              CLAIMED
            </span>
          )}
        </div>

        <h3 className="mt-3 truncate text-sm font-semibold text-white">
          {skill.name}
        </h3>

        <p className="mt-1 text-[10px] text-slate-500">
          {mastered
            ? "Skill mastered"
            : practiced
              ? "Practice completed"
              : claimed
                ? "Currently learning"
                : locked
                  ? "Complete prerequisites"
                  : "Ready to learn"}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-[#050816] !bg-slate-600"
      />
    </button>
  );
}

/* =========================================================
   CAREER TARGET NODE
========================================================= */

function CareerTargetNode({
  data,
}: NodeProps<{ name: string; progress: number }>) {
  return (
    <div className="relative w-[230px] rounded-2xl border border-blue-500/40 bg-linear-to-br from-[#101D35] to-[#0B1120] p-5 shadow-xl shadow-blue-500/10">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-[#050816] !bg-blue-400"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
          <Target className="h-5 w-5 text-blue-400" />
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-widest text-blue-400">
            Career Goal
          </p>

          <h3 className="mt-1 text-sm font-semibold text-white">{data.name}</h3>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Readiness</span>

          <span className="text-[10px] font-semibold text-blue-400">
            {data.progress}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NODE TYPES
   Defined outside the component so React Flow doesn't see a
   "new" object on every render (avoids the nodeTypes warning).
========================================================= */

const nodeTypes = {
  skill: SkillNode,
  career: CareerTargetNode,
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CareerMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progress, setProgress] = useState<Record<string, SkillProgress>>({});
  const [enrolledRoles, setEnrolledRoles] = useState<string[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/roles"),
      api.get("/skills"),
      api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/progress/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([rolesRes, skillsRes, userRes, progressRes]) => {
        const roleData: Role[] = rolesRes.data || [];
        const skillData: Skill[] = skillsRes.data || [];
        const enrolled = userRes.data.enrolledRoles || [];

        setRoles(roleData);
        setSkills(skillData);
        setEnrolledRoles(enrolled);
        setProgress(progressRes.data || {});

        // Honor a specific role passed via ?role=roleId (e.g. from the
        // Roadmaps or Careers "Continue" buttons). Fall back to the
        // learner's first enrolled role if none was requested, or if the
        // requested role isn't actually one they're enrolled in.
        const requestedRole = searchParams.get("role");

        if (requestedRole && enrolled.includes(requestedRole)) {
          setActiveRoleId(requestedRole);
        } else if (enrolled.length > 0) {
          setActiveRoleId(enrolled[0]);
        }
      })
      .catch((error) => {
        console.error("Failed to load career map:", error);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* =======================================================
     ACTIVE ROLE
  ======================================================= */

  const activeRole = roles.find((role) => role.roleId === activeRoleId);

  /* =======================================================
     SKILL LOOKUP
  ======================================================= */

  const skillMap = useMemo(() => {
    const map: Record<string, Skill> = {};
    skills.forEach((skill) => {
      map[skill.skillId] = skill;
    });
    return map;
  }, [skills]);

  /* =======================================================
     ROLE SKILLS
  ======================================================= */

  const roleSkills = useMemo(() => {
    if (!activeRole) return [];
    return activeRole.requiredSkills
      .map((skillId) => skillMap[skillId])
      .filter(Boolean);
  }, [activeRole, skillMap]);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const completedSkills = roleSkills.filter(
    (skill) => progress[skill.skillId]?.status === "mastered",
  );

  const practicedSkills = roleSkills.filter(
    (skill) => progress[skill.skillId]?.status === "practiced",
  );

  const progressPercent =
    roleSkills.length > 0
      ? Math.round((completedSkills.length / roleSkills.length) * 100)
      : 0;

  /* =======================================================
     NEXT SKILL
  ======================================================= */

  const nextSkill = roleSkills.find(
    (skill) => !progress[skill.skillId]?.status,
  );

  /* =======================================================
     SKILL CLICK
  ======================================================= */

  const handleSkillClick = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
  }, []);

  /* =======================================================
     ACTION

     Only "claim" is a real, direct action here. Moving a skill to
     "practiced" or "mastered" happens automatically on the backend
     once the learner submits and passes the stage-gated projects for
     that skill (see /skill/[skillId]) — it is never set directly from
     this page.
  ======================================================= */

  const updateSkillStatus = async (skillId: string, action: "claim") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setActionLoading(true);

    try {
      await api.post(
        "/progress/mark-learned",
        { skillId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProgress((prev) => ({
        ...prev,
        [skillId]: { status: "claimed", lastUpdated: new Date().toISOString() },
      }));
    } catch (error) {
      console.error("Failed to mark skill as learned:", error);
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     CREATE NODES
  ======================================================= */

  const initialNodes = useMemo(() => {
    if (!activeRole) return [];

    const nodes: Node[] = [];
    const columns = 3;

    roleSkills.forEach((skill, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const status = progress[skill.skillId]?.status || "";
      const prerequisites = skill.prerequisites || [];

      const locked =
        prerequisites.length > 0 &&
        prerequisites.some((id) => !progress[id]?.status);

      nodes.push({
        id: skill.skillId,
        type: "skill",
        position: { x: column * 280, y: row * 170 },
        data: { skill, status, locked, onClick: handleSkillClick },
      });
    });

    const targetY = (Math.ceil(roleSkills.length / columns) + 1) * 170;

    nodes.push({
      id: "career-target",
      type: "career",
      position: { x: 280, y: targetY },
      data: { name: activeRole.name, progress: progressPercent },
    });

    return nodes;
  }, [activeRole, roleSkills, progress, progressPercent, handleSkillClick]);

  /* =======================================================
     CREATE EDGES
  ======================================================= */

  const initialEdges = useMemo(() => {
    if (!activeRole) return [];

    const edges: Edge[] = [];

    roleSkills.forEach((skill) => {
      const prerequisites = skill.prerequisites || [];

      prerequisites.forEach((prerequisite) => {
        if (activeRole.requiredSkills.includes(prerequisite)) {
          edges.push({
            id: `${prerequisite}-${skill.skillId}`,
            source: prerequisite,
            target: skill.skillId,
            type: "smoothstep",
            animated: !progress[skill.skillId]?.status,
            style: {
              stroke:
                progress[skill.skillId]?.status === "mastered"
                  ? "#34D399"
                  : "#334155",
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color:
                progress[skill.skillId]?.status === "mastered"
                  ? "#34D399"
                  : "#475569",
            },
          });
        }
      });
    });

    const finalSkills = roleSkills.filter((skill) => {
      const hasChild = roleSkills.some((other) =>
        other.prerequisites?.includes(skill.skillId),
      );
      return !hasChild;
    });

    finalSkills.forEach((skill) => {
      edges.push({
        id: `${skill.skillId}-career`,
        source: skill.skillId,
        target: "career-target",
        type: "smoothstep",
        style: { stroke: "#2563EB", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#2563EB" },
      });
    });

    return edges;
  }, [activeRole, roleSkills, progress]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Building your career map...</p>
        </div>
      </main>
    );
  }

  /* =======================================================
     NO ENROLLED CAREER
  ======================================================= */

  if (enrolledRoles.length === 0) {
    return (
      <main className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Map className="h-7 w-7 text-blue-400" />
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Your career map is empty
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Choose a career pathway first. Your personalized skill map will
              appear here after you enroll.
            </p>

            <button
              onClick={() => router.push("/careers")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
            >
              Explore Careers
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* TOP HEADER */}
      <div className="border-b border-slate-800 bg-[#080D18]">
        <div className="mx-auto max-w-[1500px] px-5 py-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/roadmaps")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0B1120] text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-blue-400">
                    Career Map
                  </span>
                </div>

                <h1 className="mt-1 text-xl font-bold text-white">
                  {activeRole?.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={activeRoleId}
                  onChange={(e) => setActiveRoleId(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-800 bg-[#0B1120] py-2.5 pl-4 pr-10 text-sm text-slate-200 outline-none hover:border-slate-700 focus:border-blue-500/50"
                >
                  {roles
                    .filter((role) => enrolledRoles.includes(role.roleId))
                    .map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.name}
                      </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>

              <button
                onClick={() => router.push("/roadmaps")}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-2.5 text-sm text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <BookOpen className="h-4 w-4" />
                Roadmap
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-500">Readiness</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {progressPercent}%
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-500">Mastered</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {completedSkills.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-500">Practiced</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {practicedSkills.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">Total Skills</span>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {roleSkills.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="relative h-[calc(100vh-235px)] min-h-[650px]">
        <div className="absolute left-5 top-5 z-10">
          <div className="rounded-xl border border-slate-800 bg-[#0B1120]/95 px-4 py-3 shadow-xl backdrop-blur">
            <p className="text-[10px] uppercase tracking-widest text-slate-600">
              Learning Path
            </p>
            <p className="mt-1 text-sm font-medium text-slate-300">
              Follow the connections to reach your career goal
            </p>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 z-10">
          <div className="rounded-xl border border-slate-800 bg-[#0B1120]/95 p-4 shadow-xl backdrop-blur">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-slate-600">
              Skill status
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-500">Mastered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-[11px] text-slate-500">Practiced</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="text-[11px] text-slate-500">Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                <span className="text-[11px] text-slate-500">Not started</span>
              </div>
            </div>
          </div>
        </div>

        {nextSkill && (
          <div className="absolute right-5 top-5 z-10 w-[250px]">
            <div className="rounded-xl border border-blue-500/20 bg-[#0B1120]/95 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-blue-400">
                  Recommended Next
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-white">
                {nextSkill.name}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Complete this skill to continue progressing through your
                pathway.
              </p>

              <button
                onClick={() => setSelectedSkill(nextSkill)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition"
              >
                Open Skill
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.35}
          maxZoom={1.5}
          className="bg-[#050816]"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} color="#172033" />
          <Controls className="!overflow-hidden !rounded-xl !border !border-slate-800 !bg-[#0B1120] [&>button]:!border-slate-800 [&>button]:!bg-[#0B1120] [&>button]:!text-slate-400 [&>button:hover]:!bg-[#111827] [&>button:hover]:!text-white" />
        </ReactFlow>

        {/* SKILL DETAIL PANEL */}
        {selectedSkill && (
          <div className="absolute right-0 top-0 z-20 h-full w-full max-w-[390px] border-l border-slate-800 bg-[#080D18] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <Code2 className="h-4 w-4 text-blue-400" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600">
                    Skill
                  </p>
                  <h2 className="text-sm font-semibold text-white">
                    {selectedSkill.name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedSkill(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="h-[calc(100%-65px)] overflow-y-auto p-5">
              <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Current status
                </p>

                <div className="mt-3 flex items-center gap-3">
                  {progress[selectedSkill.skillId]?.status === "mastered" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-emerald-400">
                          Mastered
                        </p>
                        <p className="text-[11px] text-slate-600">
                          You&apos;ve completed this skill.
                        </p>
                      </div>
                    </>
                  ) : progress[selectedSkill.skillId]?.status ===
                    "practiced" ? (
                    <>
                      <Play className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-blue-400">
                          Practiced
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Keep practicing to master it.
                        </p>
                      </div>
                    </>
                  ) : progress[selectedSkill.skillId]?.status === "claimed" ? (
                    <>
                      <Clock3 className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400">
                          Learning
                        </p>
                        <p className="text-[11px] text-slate-600">
                          This is currently in progress.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Not started
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Start learning this skill.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-semibold text-white">
                  About this skill
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {selectedSkill.description ||
                    `Learn ${selectedSkill.name} and build the practical knowledge required for your ${activeRole?.name} pathway.`}
                </p>
              </div>

              {selectedSkill.prerequisites &&
                selectedSkill.prerequisites.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold text-white">
                      Prerequisites
                    </h3>

                    <div className="mt-3 space-y-2">
                      {selectedSkill.prerequisites.map((id) => {
                        const prerequisite = skillMap[id];
                        const done = !!progress[id]?.status;

                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0B1120] px-3 py-2.5"
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-600" />
                            )}

                            <span
                              className={`text-xs ${
                                done ? "text-emerald-400" : "text-slate-400"
                              }`}
                            >
                              {prerequisite?.name || id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="mt-7">
                <h3 className="text-xs font-semibold text-white">Progress</h3>

                <div className="mt-3 space-y-2">
                  {!progress[selectedSkill.skillId]?.status && (
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        updateSkillStatus(selectedSkill.skillId, "claim")
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/15 transition disabled:opacity-50"
                    >
                      <Clock3 className="h-4 w-4" />
                      Start Learning
                    </button>
                  )}

                  {(progress[selectedSkill.skillId]?.status === "claimed" ||
                    progress[selectedSkill.skillId]?.status ===
                      "practiced") && (
                    <button
                      onClick={() =>
                        router.push(`/skill/${selectedSkill.skillId}`)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-500 transition"
                    >
                      <BookOpen className="h-4 w-4" />
                      {progress[selectedSkill.skillId]?.status === "practiced"
                        ? "Finish Second Project"
                        : "Build a Project to Progress"}
                    </button>
                  )}

                  {progress[selectedSkill.skillId]?.status === "mastered" && (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Skill mastered
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedSkill(null)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-2.5 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                Close
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
