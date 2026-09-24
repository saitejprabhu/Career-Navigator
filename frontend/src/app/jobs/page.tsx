"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  MapPin,
  Search,
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

interface Job {
  id?: string | number;
  title: string;
  url: string;
  company_name?: string;
  // Optional extras: shown only if your backend returns them.
  candidate_required_location?: string;
  job_type?: string;
  publication_date?: string;
}

// Keep only well-formed jobs with http(s) links so a bad API response can't
// render broken cards or non-web links.
const cleanJobs = (data: unknown): Job[] =>
  Array.isArray(data)
    ? data.filter(
        (j): j is Job =>
          !!j &&
          typeof j.title === "string" &&
          typeof j.url === "string" &&
          /^https?:\/\//i.test(j.url),
      )
    : [];

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

/* =========================================================
   LOADING VIEW
========================================================= */

function JobsLoading() {
  return (
    <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading job board...</p>
      </div>
    </main>
  );
}

/* =========================================================
   MAIN CONTENT
========================================================= */

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roles, setRoles] = useState<Role[]>([]);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [activeRoleId, setActiveRoleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Jobs are cached per role. A role with neither jobs nor a failure is
  // still loading.
  const [jobsByRole, setJobsByRole] = useState<Record<string, Job[]>>({});
  const [jobsFailed, setJobsFailed] = useState<Record<string, boolean>>({});
  const [jobsReload, setJobsReload] = useState(0);
  const [query, setQuery] = useState("");

  /* =======================================================
     LOAD ROLES + USER
  ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    let cancelled = false;
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    Promise.all([api.get("/roles"), api.get("/users/me", auth)])
      .then(([rolesRes, userRes]) => {
        if (cancelled) return;

        const roleData: Role[] = rolesRes.data || [];
        const enrolledIds: string[] = userRes.data.enrolledRoles || [];

        setRoles(roleData);
        setEnrolled(enrolledIds);

        // Priority: ?role= from the URL, then the learner's first enrolled
        // role, then the first role available.
        const requested = searchParams.get("role");

        if (requested && roleData.some((r) => r.roleId === requested)) {
          setActiveRoleId(requested);
        } else {
          const firstEnrolled = roleData.find((r) =>
            enrolledIds.includes(r.roleId),
          );
          setActiveRoleId((firstEnrolled ?? roleData[0])?.roleId ?? "");
        }
      })
      .catch((error) => {
        if (cancelled) return;

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        console.error("Failed to load job board:", error);
        setLoadError("We couldn't load the job board. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, reloadKey]);

  /* =======================================================
     ROLES ORDERED: ENROLLED FIRST
  ======================================================= */

  const orderedRoles = useMemo(
    () => [
      ...roles.filter((r) => enrolled.includes(r.roleId)),
      ...roles.filter((r) => !enrolled.includes(r.roleId)),
    ],
    [roles, enrolled],
  );

  const activeRole = roles.find((r) => r.roleId === activeRoleId);
  const activeRoleName = activeRole?.name;

  /* =======================================================
     LOAD JOBS FOR THE ACTIVE ROLE
     Runs when the role changes or Retry is pressed. setState only
     happens in the promise callbacks.
  ======================================================= */

  useEffect(() => {
    if (!activeRoleId || !activeRoleName) return;

    let cancelled = false;

    api
      .get("/jobs", { params: { role: activeRoleName } })
      .then((res) => {
        if (cancelled) return;
        setJobsByRole((prev) => ({
          ...prev,
          [activeRoleId]: cleanJobs(res.data),
        }));
        setJobsFailed((prev) => ({ ...prev, [activeRoleId]: false }));
      })
      .catch((error) => {
        console.error(`Failed to load jobs for ${activeRoleName}:`, error);
        if (cancelled) return;
        setJobsFailed((prev) => ({ ...prev, [activeRoleId]: true }));
      });

    return () => {
      cancelled = true;
    };
  }, [activeRoleId, activeRoleName, jobsReload]);

  /* =======================================================
     DERIVED VIEW STATE
  ======================================================= */

  const jobs = jobsByRole[activeRoleId];
  const failed = jobsFailed[activeRoleId];

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.company_name ?? "").toLowerCase().includes(q),
    );
  }, [jobs, query]);

  const selectRole = (roleId: string) => {
    if (roleId === activeRoleId) return;
    setActiveRoleId(roleId);
    setQuery("");
    router.replace(`/jobs?role=${encodeURIComponent(roleId)}`, {
      scroll: false,
    });
  };

  const retryJobs = () => {
    setJobsFailed((prev) => ({ ...prev, [activeRoleId]: false }));
    setJobsReload((k) => k + 1);
  };

  /* =======================================================
     EARLY RETURNS (all hooks are declared above)
  ======================================================= */

  if (loading) return <JobsLoading />;

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm text-slate-400">{loadError}</p>

          <button
            onClick={() => {
              setLoadError(null);
              setLoading(true);
              setReloadKey((k) => k + 1);
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (roles.length === 0) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm text-slate-400">
            No career paths are available yet.
          </p>

          <button
            onClick={() => router.push("/careers")}
            className="mt-4 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-2 text-sm text-slate-300 transition hover:text-white"
          >
            Back to careers
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/careers")}
            aria-label="Back to careers"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0B1120] text-slate-400 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-blue-400">
                Job Board
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Open roles right now
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Live openings for each career path. Pick a path to see current
          listings — links open on the original job site.
        </p>

        {/* Role selector */}
        <div className="mt-6 flex flex-wrap gap-2" role="tablist">
          {orderedRoles.map((role) => {
            const active = role.roleId === activeRoleId;
            const isEnrolled = enrolled.includes(role.roleId);

            return (
              <button
                key={role.roleId}
                role="tab"
                aria-selected={active}
                onClick={() => selectRole(role.roleId)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                    : "border-slate-800 bg-[#0B1120] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {role.name}
                {isEnrolled && (
                  <span className="ml-1.5 text-[10px] text-emerald-400">●</span>
                )}
              </button>
            );
          })}
        </div>

        {enrolled.length > 0 && (
          <p className="mt-2 text-[11px] text-slate-600">
            <span className="text-emerald-400">●</span> paths you&apos;re
            enrolled in
          </p>
        )}

        {/* Search + count */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or company"
              className="w-full rounded-lg border border-slate-800 bg-[#0B1120] py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/50"
            />
          </div>

          {jobs && (
            <span className="text-xs text-slate-600">
              {query.trim()
                ? `${filteredJobs.length} of ${jobs.length} jobs`
                : `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="mt-4 space-y-3">
          {jobs ? (
            filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const posted = formatDate(job.publication_date);

                return (
                  <a
                    key={job.id ?? job.url}
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-[#0B1120] p-4 transition hover:border-blue-500/40"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-blue-300">
                        {job.title}
                      </h3>

                      {job.company_name && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                          <span className="truncate">{job.company_name}</span>
                        </p>
                      )}

                      {(job.candidate_required_location ||
                        job.job_type ||
                        posted) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.candidate_required_location && (
                            <span className="flex items-center gap-1 rounded-md border border-slate-800 bg-[#060B16] px-2 py-1 text-[11px] text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {job.candidate_required_location}
                            </span>
                          )}

                          {job.job_type && (
                            <span className="rounded-md border border-slate-800 bg-[#060B16] px-2 py-1 text-[11px] capitalize text-slate-500">
                              {job.job_type.replace(/_/g, " ")}
                            </span>
                          )}

                          {posted && (
                            <span className="rounded-md border border-slate-800 bg-[#060B16] px-2 py-1 text-[11px] text-slate-500">
                              Posted {posted}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-blue-400" />
                  </a>
                );
              })
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-8 text-center">
                <p className="text-sm text-slate-400">
                  {query.trim()
                    ? "No jobs match your search."
                    : `No open ${activeRoleName} roles found right now.`}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {query.trim()
                    ? "Try a different keyword."
                    : "Check back later or try another path."}
                </p>
              </div>
            )
          ) : failed ? (
            <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-8 text-center">
              <p className="text-sm text-slate-400">
                We couldn&apos;t load jobs for {activeRoleName}.
              </p>

              <button
                onClick={retryJobs}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
              >
                Try again
              </button>
            </div>
          ) : (
            // Skeleton while the first request for this role is in flight
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-800 bg-[#0B1120] p-4"
              >
                <div className="h-3.5 w-2/3 rounded bg-slate-800" />
                <div className="mt-3 h-3 w-1/3 rounded bg-slate-800/70" />
                <div className="mt-4 flex gap-2">
                  <div className="h-5 w-16 rounded bg-slate-800/60" />
                  <div className="h-5 w-20 rounded bg-slate-800/60" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PAGE EXPORT
   useSearchParams() must sit under a Suspense boundary or
   `next build` fails during static prerendering.
========================================================= */

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsLoading />}>
      <JobsContent />
    </Suspense>
  );
}
