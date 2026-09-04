"use client";
import { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import api from "@/lib/api";
import { useCareerStore } from "@/store/useCareerStore";

interface Skill {
  skillId: string;
  name: string;
  prerequisites: string[];
}

export default function CareerMapPage() {
  const { profile } = useCareerStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/skills")
      .then((res) => setSkills(res.data))
      .catch((err) => console.error("Failed to fetch skills:", err))
      .finally(() => setLoading(false));
  }, []);

  const getColor = (skillId: string) => {
    if (profile.skills.includes(skillId)) return "#22c55e"; // green = acquired
    return "#9ca3af"; // grey = missing
  };

  const nodes: Node[] = skills.map((skill, index) => ({
    id: skill.skillId,
    data: { label: skill.name },
    position: { x: index * 180, y: 100 },
    style: {
      background: getColor(skill.skillId),
      color: "#fff",
      borderRadius: 8,
      padding: 10,
    },
  }));

  const edges: Edge[] = skills.flatMap((skill) =>
    skill.prerequisites.map((prereq) => ({
      id: `${prereq}-${skill.skillId}`,
      source: prereq,
      target: skill.skillId,
    })),
  );

  if (loading) return <div className="p-8">Loading career map...</div>;

  return (
    <div style={{ height: "80vh" }}>
      <h1 className="text-2xl font-bold p-4">Your Career Map</h1>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
