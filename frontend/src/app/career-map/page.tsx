// frontend/src/app/career-map/page.tsx
"use client";
import ReactFlow, { Background, Controls, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { skills } from "@/data/skills";
import { useCareerStore } from "@/store/useCareerStore";

export default function CareerMapPage() {
  const { profile } = useCareerStore();

  const getColor = (skillId: string) => {
    if (profile.skills.includes(skillId)) return "#22c55e"; // green = acquired
    return "#9ca3af"; // grey = missing
  };

  const nodes: Node[] = skills.map((skill, index) => ({
    id: skill.id,
    data: { label: skill.name },
    position: { x: index * 180, y: 100 },
    style: {
      background: getColor(skill.id),
      color: "#fff",
      borderRadius: 8,
      padding: 10,
    },
  }));

  const edges: Edge[] = skills.flatMap((skill) =>
    skill.prerequisites.map((prereq) => ({
      id: `${prereq}-${skill.id}`,
      source: prereq,
      target: skill.id,
    })),
  );

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
