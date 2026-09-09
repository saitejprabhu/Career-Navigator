"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  FileCheck2,
  Lightbulb,
  Loader2,
  Map,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

interface Project {
  projectId: string;
  title: string;
  description: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export default function SkillDetailPage() {
  const params = useParams();

  const skillId = Array.isArray(params.skillId)
    ? params.skillId[0]
    : params.skillId;

  const [projects, setProjects] = useState<Project[]>([]);

  const [githubUrls, setGithubUrls] = useState<Record<string, string>>({});

  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const [answers, setAnswers] = useState<Record<string, number[]>>({});

  const [results, setResults] = useState<Record<string, { passed: boolean }>>(
    {},
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [submittingProject, setSubmittingProject] = useState<string | null>(
    null,
  );

  const [submittingQuiz, setSubmittingQuiz] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* =========================================================
     LOAD PROJECTS
  ========================================================= */

  useEffect(() => {
    if (!skillId) return;

    api
      .get(`/projects/${skillId}`)
      .then((res) => {
        setProjects(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);

        setError("Unable to load projects for this skill.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [skillId]);

  /* =========================================================
     SUBMIT PROJECT
  ========================================================= */

  const handleSubmitProject = async (project: Project) => {
    const url = githubUrls[project.projectId];

    if (!url?.trim()) {
      alert("Please enter your GitHub repository URL.");
      return;
    }

    setSubmittingProject(project.projectId);

    try {
      await api.post(
        `/projects/${project.projectId}/submit`,
        {
          githubUrl: url.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSubmitted((prev) => ({
        ...prev,
        [project.projectId]: true,
      }));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : "Submission failed";

      alert(message || "Submission failed");
    } finally {
      setSubmittingProject(null);
    }
  };

  /* =========================================================
     SELECT QUIZ ANSWER
  ========================================================= */

  const handleAnswer = (
    projectId: string,
    questionIndex: number,
    optionIndex: number,
  ) => {
    setAnswers((prev) => {
      const updated = [...(prev[projectId] || [])];

      updated[questionIndex] = optionIndex;

      return {
        ...prev,
        [projectId]: updated,
      };
    });
  };

  /* =========================================================
     SUBMIT QUIZ
  ========================================================= */

  const handleSubmitQuiz = async (project: Project) => {
    const projectAnswers = answers[project.projectId] || [];

    const allAnswered = project.quiz.every(
      (_, index) => projectAnswers[index] !== undefined,
    );

    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmittingQuiz(project.projectId);

    try {
      const res = await api.post(
        `/projects/${project.projectId}/quiz`,
        {
          answers: projectAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResults((prev) => ({
        ...prev,
        [project.projectId]: res.data,
      }));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : "Quiz submission failed";

      alert(message || "Quiz submission failed");
    } finally {
      setSubmittingQuiz(null);
    }
  };

  /* =========================================================
     RETRY QUIZ
  ========================================================= */

  const handleRetryQuiz = (projectId: string) => {
    setResults((prev) => {
      const updated = { ...prev };

      delete updated[projectId];

      return updated;
    });

    setAnswers((prev) => ({
      ...prev,
      [projectId]: [],
    }));
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            </div>

            <p className="text-sm text-slate-500">Loading projects...</p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-[#050816] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-red-500/20 bg-[#0B1120] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>

            <h1 className="mt-5 text-lg font-semibold text-white">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Try Again
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="border-b border-slate-800/80 bg-[#080D18]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Back button */}

          <div className="mb-7 flex flex-wrap items-center gap-3">
            {/* Career Map */}

            <button
              onClick={() => {
                window.location.href = "/career-map";
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-white"
            >
              <Map className="h-4 w-4 text-blue-400" />
              Career Map
            </button>

            {/* My Roadmaps */}

            <button
              onClick={() => {
                window.location.href = "/roadmaps";
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-purple-400" />
              My Roadmaps
            </button>
          </div>

          {/* Header content */}

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {/* Label */}

              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <Code2 className="h-4 w-4 text-blue-400" />
                </div>

                <span className="text-xs font-medium uppercase tracking-widest text-blue-400">
                  Skill Development
                </span>
              </div>

              {/* Skill name */}

              <h1 className="text-3xl font-bold tracking-tight text-white">
                {skillId}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Build practical knowledge through projects and verify your
                understanding with a short assessment.
              </p>
            </div>

            {/* Stats */}

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-5 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Projects
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {projects.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0B1120] px-5 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Assessments
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {projects.filter((project) => project.quiz.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* ===================================================
            LEARNING FLOW
        =================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Build */}

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B1120] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <BookOpen className="h-4 w-4 text-blue-400" />
            </div>

            <div>
              <p className="text-xs font-medium text-white">01 · Build</p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                Complete the project
              </p>
            </div>
          </div>

          {/* Submit */}

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B1120] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <FileCheck2 className="h-4 w-4 text-purple-400" />
            </div>

            <div>
              <p className="text-xs font-medium text-white">02 · Submit</p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                Share your GitHub repository
              </p>
            </div>
          </div>

          {/* Verify */}

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B1120] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Trophy className="h-4 w-4 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-medium text-white">03 · Verify</p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                Pass the skill assessment
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {projects.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-slate-800 bg-[#060B16]">
              <Code2 className="h-6 w-6 text-slate-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              No projects available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no projects available for this skill.
            </p>
          </div>
        )}

        {/* ===================================================
            PROJECT LIST
        =================================================== */}

        <div className="space-y-8">
          {projects.map((project, projectIndex) => {
            const projectResult = results[project.projectId];

            const projectAnswers = answers[project.projectId] || [];

            const answeredCount = projectAnswers.filter(
              (answer) => answer !== undefined,
            ).length;

            return (
              <section
                key={project.projectId}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120]"
              >
                {/* =========================================
                      PROJECT HEADER
                  ========================================= */}

                <div className="border-b border-slate-800 p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      {/* Number */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-sm font-bold text-blue-400">
                        {String(projectIndex + 1).padStart(2, "0")}
                      </div>

                      {/* Title */}

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-white">
                            {project.title}
                          </h2>

                          {submitted[project.projectId] && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                              <Check className="h-3 w-3" />
                              Submitted
                            </span>
                          )}
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Project type */}

                    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-800 bg-[#060B16] px-3 py-2">
                      <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />

                      <span className="text-[11px] text-slate-500">
                        Practical project
                      </span>
                    </div>
                  </div>
                </div>

                {/* =========================================
                      PROJECT SUBMISSION
                  ========================================= */}

                {!submitted[project.projectId] && (
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-slate-300" />

                        <h3 className="text-sm font-semibold text-white">
                          Submit your project
                        </h3>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Push your project to GitHub and paste the repository URL
                        below.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-[#060B16] p-4">
                      <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-slate-600">
                        GitHub repository
                      </label>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                          <Code2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                          <input
                            type="url"
                            value={githubUrls[project.projectId] || ""}
                            onChange={(e) =>
                              setGithubUrls((prev) => ({
                                ...prev,
                                [project.projectId]: e.target.value,
                              }))
                            }
                            placeholder="https://github.com/username/project"
                            className="h-11 w-full rounded-lg border border-slate-800 bg-[#0B1120] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                          />
                        </div>

                        <button
                          onClick={() => handleSubmitProject(project)}
                          disabled={submittingProject === project.projectId}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submittingProject === project.projectId ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Project
                              <Send className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500/70" />

                      <p className="text-[11px] leading-5 text-slate-600">
                        Make sure your repository is accessible and contains the
                        completed project before submitting.
                      </p>
                    </div>
                  </div>
                )}

                {/* =========================================
                      QUIZ
                  ========================================= */}

                {submitted[project.projectId] && !projectResult && (
                  <div className="p-6">
                    {/* Quiz header */}

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              Verification Quiz
                            </h3>

                            <p className="mt-0.5 text-[11px] text-slate-600">
                              Verify your understanding
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quiz progress */}

                      <div className="min-w-[170px]">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-600">
                            Progress
                          </span>

                          <span className="text-[10px] font-medium text-slate-400">
                            {answeredCount}/{project.quiz.length}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                            style={{
                              width: `${
                                project.quiz.length
                                  ? (answeredCount / project.quiz.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Questions */}

                    <div className="space-y-6">
                      {project.quiz.map((question, questionIndex) => {
                        const selected = projectAnswers[questionIndex];

                        return (
                          <div
                            key={questionIndex}
                            className="rounded-xl border border-slate-800 bg-[#060B16] p-5"
                          >
                            {/* Question */}

                            <div className="flex gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-400">
                                {questionIndex + 1}
                              </div>

                              <p className="pt-1 text-sm font-medium leading-6 text-slate-200">
                                {question.question}
                              </p>
                            </div>

                            {/* Options */}

                            <div className="mt-4 space-y-2">
                              {question.options.map((option, optionIndex) => {
                                const isSelected = selected === optionIndex;

                                return (
                                  <button
                                    key={optionIndex}
                                    type="button"
                                    onClick={() =>
                                      handleAnswer(
                                        project.projectId,
                                        questionIndex,
                                        optionIndex,
                                      )
                                    }
                                    className={`
                                              group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all
                                              ${
                                                isSelected
                                                  ? "border-blue-500/40 bg-blue-500/10"
                                                  : "border-slate-800 bg-[#0B1120] hover:border-slate-700 hover:bg-[#101827]"
                                              }
                                            `}
                                  >
                                    {/* Radio */}

                                    <div
                                      className={`
                                                flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition
                                                ${
                                                  isSelected
                                                    ? "border-blue-400 bg-blue-500"
                                                    : "border-slate-700 bg-transparent group-hover:border-slate-500"
                                                }
                                              `}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </div>

                                    {/* Text */}

                                    <span
                                      className={`
                                                text-xs leading-5
                                                ${
                                                  isSelected
                                                    ? "font-medium text-blue-300"
                                                    : "text-slate-400 group-hover:text-slate-200"
                                                }
                                              `}
                                    >
                                      {option}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quiz footer */}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] text-slate-600">
                        Answer all questions before submitting.
                      </p>

                      <button
                        onClick={() => handleSubmitQuiz(project)}
                        disabled={submittingQuiz === project.projectId}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submittingQuiz === project.projectId ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            Submit Quiz
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* =========================================
                      RESULT
                  ========================================= */}

                {submitted[project.projectId] && projectResult && (
                  <div className="p-6">
                    {projectResult.passed ? (
                      /* ===================================
                             PASSED
                          =================================== */

                      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7">
                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="relative text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                            <Trophy className="h-6 w-6 text-emerald-400" />
                          </div>

                          <h3 className="mt-4 text-xl font-bold text-white">
                            Skill verified!
                          </h3>

                          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Great work. You successfully completed the project
                            and passed the verification quiz.
                          </p>

                          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Project completed
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ===================================
                             FAILED
                          =================================== */

                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-7">
                        <div className="text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                            <XCircle className="h-6 w-6 text-red-400" />
                          </div>

                          <h3 className="mt-4 text-xl font-bold text-white">
                            Almost there
                          </h3>

                          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            You didn&apos;t pass this attempt, but you can
                            review the concepts and try the verification quiz
                            again.
                          </p>

                          <button
                            onClick={() => handleRetryQuiz(project.projectId)}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0B1120] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:text-white"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* =====================================================
            LEARNING TIP
        ===================================================== */}

        {projects.length > 0 && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0B1120] p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Lightbulb className="h-4 w-4 text-blue-400" />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white">Learning tip</h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Do not just complete the project to pass the assessment. Make
                sure you understand why your solution works. Practical
                understanding will help you progress through your career map.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
