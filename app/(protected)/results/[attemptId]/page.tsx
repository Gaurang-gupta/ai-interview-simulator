import { createServerSupabaseClient } from "@/lib/supabase_server";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Lightbulb,
  PlayIcon,
  RefreshCw,
  StickyNote,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import ScoreCircle from "@/components/ScoreCircle";
import { notFound } from "next/navigation";
import { AttemptResult } from "@/types";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const { attemptId } = await params;

  const { data, error } = await supabase
    .from("attempts")
    .select(
      `
        score,
        report_json,
        topic_slug_snapshot,
        topics ( name )
      `,
    )
    .eq("id", attemptId)
    .single();

  if (error || !data) {
    return notFound();
  }

  const typedData = data as unknown as AttemptResult;
  const report = typedData.report_json;

  const topicName = Array.isArray(typedData.topics)
    ? typedData.topics[0]?.name
    : typedData.topics?.name || "Technical Assessment";

  const retrySlug = typedData.topic_slug_snapshot || "general";

  return (
    <div className="min-h-screen px-6 py-12 bg-[#030712] text-slate-200 selection:bg-indigo-500/30 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link
              href="/history"
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 mb-6 transition-all group font-bold text-xs uppercase tracking-widest"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Return to History
            </Link>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Analysis: <span className="text-indigo-500">{topicName}</span>
            </h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                <Gauge size={12} /> Confidence: {report.confidence_score}%
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                AI Evaluator v2.0
              </div>
            </div>
          </div>

          <div className="relative group scale-110">
            <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <ScoreCircle score={typedData.score} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN ANALYSIS COLUMN (LHS) */}
          <div className="lg:col-span-8 space-y-8">
            {/* EVALUATOR NOTES (NEWLY INTEGRATED) */}
            {report.evaluator_notes && report.evaluator_notes.length > 0 && (
              <section className="glass rounded-[2rem] border border-indigo-500/20 bg-indigo-500/[0.03] p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 text-indigo-300 font-bold text-xs uppercase tracking-[0.2em]">
                  <StickyNote size={14} /> Evaluator Key Insights
                </div>
                <ul className="space-y-3">
                  {report.evaluator_notes.map((note, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm text-slate-300 leading-relaxed group"
                    >
                      <span className="text-indigo-500 font-bold">•</span>
                      <span className="group-hover:text-white transition-colors">
                        {note}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* PROFICIENCY VISUALIZER */}
            {report.concept_scores && report.concept_scores.length > 0 && (
              <section className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Brain size={20} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    Domain Proficiency
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {report.concept_scores.map((cs, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                          {cs.concept}
                        </span>
                        <span
                          className={`text-xs font-black ${cs.score >= 70 ? "text-emerald-400" : "text-orange-400"}`}
                        >
                          {cs.score}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            cs.score >= 70
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                              : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                          }`}
                          style={{ width: `${cs.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* QUALITATIVE EVALUATION */}
            <section className="glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Target size={140} />
              </div>

              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                <Award size={16} /> Technical Summary
              </h2>

              <blockquote className="text-2xl font-medium text-slate-200 leading-relaxed italic border-l-4 border-indigo-500/30 pl-8 mb-10">
                "{report.overall_feedback}"
              </blockquote>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/10">
                  <h3 className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-4">
                    Core Strengths
                  </h3>
                  <ul className="space-y-3">
                    {report.strengths?.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-400 flex gap-3 leading-snug"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />{" "}
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 rounded-3xl bg-orange-500/[0.03] border border-orange-500/10">
                  <h3 className="text-orange-400 font-black text-[10px] uppercase tracking-widest mb-4">
                    Growth Gaps
                  </h3>
                  <ul className="space-y-3">
                    {report.weaknesses?.map((w, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-400 flex gap-3 leading-snug"
                      >
                        <AlertCircle
                          size={14}
                          className="text-orange-500 shrink-0 mt-0.5"
                        />{" "}
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR ACTION PLAN (RHS) */}
          <aside className="lg:col-span-4 space-y-6">
            <section className="glass rounded-[2.5rem] p-8 border-indigo-500/20 bg-indigo-500/[0.02] relative shadow-2xl shadow-indigo-500/10">
              <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-400" /> Mastery
                Path
              </h2>

              <div className="space-y-8 relative">
                <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-500 via-indigo-500/20 to-transparent" />

                {report.next_7_day_plan?.map((step, i) => (
                  <div key={i} className="relative pl-10 group">
                    <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[10px] font-black z-10 group-hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                      {i + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 opacity-60">
                        Day {i + 1}
                      </p>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">
                        {step.replace(/Day \d+: /, "")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center text-center">
                <Lightbulb
                  size={24}
                  className="text-yellow-500 mb-3 animate-pulse"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  "Targeting these specific internals consistently is the
                  fastest route to technical mastery."
                </p>
              </div>
            </section>

            <Link
              href={`/topic/${retrySlug}`}
              className="group flex items-center justify-between w-full p-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-3 text-sm">
                <RefreshCw
                  size={18}
                  className="group-hover:rotate-180 transition-transform duration-700"
                />
                Retry Lab
              </span>
              <ChevronRight
                size={20}
                className="relative z-10 group-hover:translate-x-1 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>

            <Link
              href={`/results/${attemptId}/replay`}
              className="group flex items-center justify-between w-full p-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-3 text-sm">
                <PlayIcon
                  size={18}
                  className="group-hover:rotate-180 transition-transform duration-700"
                />
                Replay
              </span>
              <ChevronRight
                size={20}
                className="relative z-10 group-hover:translate-x-1 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
