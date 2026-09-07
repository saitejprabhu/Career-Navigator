import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Turn what you already know into where you could go.
            </h1>
            <p className="mt-5 text-gray-400 text-lg leading-relaxed max-w-md">
              Career Navigator builds your skill profile, maps it against real
              career roles, and gives you a path forward — proven step by step,
              not just claimed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Build your profile
              </Link>
              <Link
                href="#how-it-works"
                className="border border-gray-700 hover:border-gray-500 text-gray-200 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Hero visual: the product's own skill-path diagram */}
          <div className="relative">
            <style>{`
              @keyframes cn-draw { from { stroke-dashoffset: 620; } to { stroke-dashoffset: 0; } }
              .cn-path { stroke-dasharray: 620; stroke-dashoffset: 620; animation: cn-draw 1.6s ease-out 0.3s forwards; }
              @media (prefers-reduced-motion: reduce) {
                .cn-path { animation: none; stroke-dashoffset: 0; }
              }
            `}</style>
            <svg
              viewBox="0 0 640 280"
              className="w-full h-auto"
              role="img"
              aria-label="A skill path connecting HTML, CSS, JavaScript, and React, leading to a Frontend Developer role at 82 percent readiness."
            >
              <path
                d="M 60 210 C 140 210, 160 150, 220 150 C 300 150, 300 90, 380 90 C 440 90, 460 55, 540 55"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2"
              />
              <path
                d="M 60 210 C 140 210, 160 150, 220 150 C 300 150, 300 90, 380 90 C 440 90, 460 55, 540 55"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                className="cn-path"
              />

              {/* HTML - mastered */}
              <circle cx="60" cy="210" r="9" fill="#34d399" />
              <text
                x="60"
                y="234"
                textAnchor="middle"
                fontFamily="var(--font-geist-mono, monospace)"
                fontSize="12"
                fill="#9ca3af"
              >
                html
              </text>

              {/* CSS - mastered */}
              <circle cx="220" cy="150" r="9" fill="#34d399" />
              <text
                x="220"
                y="174"
                textAnchor="middle"
                fontFamily="var(--font-geist-mono, monospace)"
                fontSize="12"
                fill="#9ca3af"
              >
                css
              </text>

              {/* JavaScript - practiced */}
              <circle
                cx="380"
                cy="90"
                r="9"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />
              <text
                x="380"
                y="70"
                textAnchor="middle"
                fontFamily="var(--font-geist-mono, monospace)"
                fontSize="12"
                fill="#9ca3af"
              >
                javascript
              </text>

              {/* React - claimed */}
              <circle
                cx="470"
                cy="72"
                r="7"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
              />
              <text
                x="470"
                y="52"
                textAnchor="middle"
                fontFamily="var(--font-geist-mono, monospace)"
                fontSize="11"
                fill="#6b7280"
              >
                react
              </text>

              {/* Role node */}
              <rect
                x="500"
                y="30"
                width="120"
                height="50"
                rx="10"
                fill="#0d1220"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <text
                x="560"
                y="52"
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#e5e7eb"
              >
                Frontend Dev
              </text>
              <text
                x="560"
                y="68"
                textAnchor="middle"
                fontSize="11"
                fill="#3b82f6"
              >
                82% ready
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="max-w-4xl mx-auto px-6 py-20 md:py-28"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-14">How it works</h2>

        <div className="relative pl-10">
          <div
            className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-800"
            aria-hidden="true"
          />

          <div className="relative pb-12">
            <span className="absolute -left-10 top-0 h-8 w-8 rounded-full bg-gray-900 border border-blue-600 text-blue-400 text-sm font-semibold flex items-center justify-center">
              1
            </span>
            <h3 className="text-lg font-semibold mb-1">Build your profile</h3>
            <p className="text-gray-400 leading-relaxed">
              Add your skills, education, certifications, and projects — the
              starting point everything else is built from.
            </p>
          </div>

          <div className="relative pb-12">
            <span className="absolute -left-10 top-0 h-8 w-8 rounded-full bg-gray-900 border border-blue-600 text-blue-400 text-sm font-semibold flex items-center justify-center">
              2
            </span>
            <h3 className="text-lg font-semibold mb-1">See your path</h3>
            <p className="text-gray-400 leading-relaxed">
              A visual map shows which roles you&apos;re closest to, what
              you&apos;ve already got, and exactly what&apos;s missing.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-10 top-0 h-8 w-8 rounded-full bg-gray-900 border border-blue-600 text-blue-400 text-sm font-semibold flex items-center justify-center">
              3
            </span>
            <h3 className="text-lg font-semibold mb-1">
              Prove it, stage by stage
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Build a small project for each skill, pass a short check, and
              watch your status move from claimed to mastered.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28 border-t border-gray-900">
        <h2 className="text-2xl md:text-3xl font-bold mb-12">
          Built to keep you honest about your own progress
        </h2>

        <div className="space-y-8">
          <div className="border-l-2 border-blue-500 pl-6">
            <h3 className="font-semibold mb-1">Stage-gated projects</h3>
            <p className="text-gray-400 leading-relaxed">
              Each skill ends with a small project you actually build and submit
              — not just a box you tick.
            </p>
          </div>

          <div className="border-l-2 border-violet-500 pl-6">
            <h3 className="font-semibold mb-1">Progress that updates itself</h3>
            <p className="text-gray-400 leading-relaxed">
              Mark a skill as learned, and your map, your skill gaps, and your
              match score update on their own.
            </p>
          </div>

          <div className="border-l-2 border-emerald-500 pl-6">
            <h3 className="font-semibold mb-1">
              A readiness score that means it
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Career Match shows overlap. Job Readiness shows what you&apos;ve
              actually proven, weighted by how well you know it.
            </p>
          </div>

          <div className="border-l-2 border-amber-400 pl-6">
            <h3 className="font-semibold mb-1">
              Streaks that forgive a bad day
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Build a learning habit and earn a freeze that protects your streak
              if you miss a day.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to see where you stand?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            It takes a few minutes to build your profile and see your first
            career match.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Create your account
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-900 py-8">
        <p className="text-center text-gray-600 text-sm">Career Navigator</p>
      </footer>
    </main>
  );
}
