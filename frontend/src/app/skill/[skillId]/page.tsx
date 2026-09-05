"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

interface Project {
  projectId: string;
  title: string;
  description: string;
  quiz: { question: string; options: string[]; correctIndex: number }[];
}

export default function SkillDetailPage() {
  const { skillId } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubUrls, setGithubUrls] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [results, setResults] = useState<Record<string, { passed: boolean }>>(
    {},
  );

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    api.get(`/projects/${skillId}`).then((res) => setProjects(res.data));
  }, [skillId]);

  const handleSubmitProject = async (project: Project) => {
    try {
      await api.post(
        `/projects/${project.projectId}/submit`,
        { githubUrl: githubUrls[project.projectId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubmitted((prev) => ({ ...prev, [project.projectId]: true }));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : "Submission failed";
      alert(message || "Submission failed");
    }
  };

  const handleSubmitQuiz = async (project: Project) => {
    try {
      const res = await api.post(
        `/projects/${project.projectId}/quiz`,
        { answers: answers[project.projectId] || [] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setResults((prev) => ({ ...prev, [project.projectId]: res.data }));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : "Submission failed";
      alert(message || "Submission failed");
    }
  };

  if (projects.length === 0)
    return <div className="p-8">Loading projects...</div>;

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Projects for {skillId}</h1>

      {projects.map((project) => (
        <div key={project.projectId} className="mb-8 border-b pb-4">
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <p className="mb-2 text-gray-600">{project.description}</p>

          {!submitted[project.projectId] ? (
            <div>
              <input
                value={githubUrls[project.projectId] || ""}
                onChange={(e) =>
                  setGithubUrls((prev) => ({
                    ...prev,
                    [project.projectId]: e.target.value,
                  }))
                }
                placeholder="Paste your GitHub repo URL"
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={() => handleSubmitProject(project)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit Project
              </button>
            </div>
          ) : !results[project.projectId] ? (
            <div>
              <h3 className="font-semibold mb-2">Verification Quiz</h3>
              {project.quiz.map((q, i) => (
                <div key={i} className="mb-3">
                  <p>{q.question}</p>
                  {q.options.map((opt, optIndex) => (
                    <label key={optIndex} className="block">
                      <input
                        type="radio"
                        name={`${project.projectId}-q-${i}`}
                        onChange={() => {
                          setAnswers((prev) => {
                            const updated = [
                              ...(prev[project.projectId] || []),
                            ];
                            updated[i] = optIndex;
                            return { ...prev, [project.projectId]: updated };
                          });
                        }}
                      />{" "}
                      {opt}
                    </label>
                  ))}
                </div>
              ))}
              <button
                onClick={() => handleSubmitQuiz(project)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Submit Quiz
              </button>
            </div>
          ) : (
            <p
              className={
                results[project.projectId].passed
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {results[project.projectId].passed
                ? "✅ Passed!"
                : "❌ Not quite — try again."}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
