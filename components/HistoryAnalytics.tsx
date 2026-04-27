"use client";

import ProgressChart from "@/components/ProgressChart";
import { AlertTriangle, Brain, ChevronRight, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ConceptScore = {
  concept: string;
  score: number;
};

type AttemptHistoryRow = {
  id: string;
  score: number | null;
  level: string;
  status: string;
  created_at: string;
  report_json: {
    concept_scores?: ConceptScore[];
  } | null;
  topics?: {
    name?: string;
  }[] | null;
};

type Props = {
  attempts: AttemptHistoryRow[];
};

export default function HistoryAnalytics({ attempts }: Props) {
  const [viewMode, setViewMode] = useState<"topic" | "combined">("topic");

  const completedAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.status === "completed" && attempt.score !== null),
    [attempts],
  );

  const weakConcepts = useMemo(() => {
    const conceptAggregator: Record<string, { total: number; count: number }> = {};

    completedAttempts.forEach((attempt) => {
      const scores = attempt.report_json?.concept_scores ?? [];
      scores.forEach((cs) => {
        if (!conceptAggregator[cs.concept]) {
          conceptAggregator[cs.concept] = { total: 0, count: 0 };
        }
        conceptAggregator[cs.concept].total += cs.score;
        conceptAggregator[cs.concept].count += 1;
      });
    });

    return Object.entries(conceptAggregator)
      .map(([name, stats]) => ({
        name,
        avg: Math.round(stats.total / stats.count),
      }))
      .filter((concept) => concept.avg < 75)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 4);
  }, [completedAttempts]);

  const groupedAttempts = useMemo(
    () =>
      completedAttempts.reduce<Record<string, AttemptHistoryRow[]>>((acc, current) => {
        const topicName = current.topics?.[0]?.name || "General Assessment";
        if (!acc[topicName]) acc[topicName] = [];
        acc[topicName].push(current);
        return acc;
      }, {}),
    [completedAttempts],
  );

  const combinedChartData = useMemo(() => {
    return completedAttempts
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((attempt, index) => ({
        attempt: index + 1,
        score: attempt.score || 0,
        label: `${attempt.topics?.[0]?.name || "General"} · ${new Date(attempt.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}`,
      }));
  }, [completedAttempts]);

  const combinedAvg =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length)
      : 0;

  const combinedBest = completedAttempts.length > 0 ? Math.max(...completedAttempts.map((attempt) => attempt.score || 0)) : 0;

  return (
    <>
      <div className="mb-8 flex items-center justify-end">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <button
            onClick={() => setViewMode("topic")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              viewMode === "topic" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-400 hover:text-white"
            }`}
          >
            Per Topic
          </button>
          <button
            onClick={() => setViewMode("combined")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              viewMode === "combined" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-400 hover:text-white"
            }`}
          >
            Combined
          </button>
        </div>
      </div>

      {weakConcepts.length > 0 && (
        <div className="mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-6 text-orange-400">
            <Brain size={20} />
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Priority Knowledge Gaps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weakConcepts.map((concept) => (
              <div
                key={concept.name}
                className="glass p-5 rounded-2xl border-orange-500/20 bg-orange-500/[0.02] group hover:bg-orange-500/[0.05] transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-xl font-black text-orange-400">{concept.avg}%</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-tight capitalize">{concept.name}</h3>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${concept.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedAttempts.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center border border-white/5">
          <p className="text-slate-400 text-sm">No completed attempts yet. Finish one interview to unlock analytics.</p>
        </div>
      )}

      {viewMode === "combined" ? (
        <section className="animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">All Topics</h2>
              <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                <Target size={14} className="text-indigo-500" />
                {completedAttempts.length} Completed Sessions
              </p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Avg Score</p>
                <p className="text-2xl font-bold text-white">{combinedAvg}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Best Score</p>
                <p className="text-2xl font-bold text-indigo-400">{combinedBest}%</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 mb-8 border-white/5">
            <div className="h-[250px] w-full">
              <ProgressChart data={combinedChartData} />
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-24">
          {Object.entries(groupedAttempts).map(([topicName, topicAttempts]) => {
            let improvement = 0;
            if (topicAttempts.length >= 2) {
              improvement = (topicAttempts[0].score || 0) - (topicAttempts[1].score || 0);
            }

            const topicBest = Math.max(...topicAttempts.map((attempt) => attempt.score || 0));
            const topicAvg = Math.round(topicAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / topicAttempts.length);
            const topicChartData = topicAttempts.slice().reverse().map((attempt, index) => ({
              attempt: index + 1,
              score: attempt.score || 0,
              label: new Date(attempt.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }),
            }));

            return (
              <section key={topicName} className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white capitalize tracking-tight">{topicName}</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <Target size={14} className="text-indigo-500" />
                        {topicAttempts.length} Total Sessions
                      </p>
                      {topicAttempts.length >= 2 && (
                        <div
                          className={`flex items-center gap-1 text-xs font-black uppercase tracking-wider ${
                            improvement >= 0 ? "text-emerald-400" : "text-rose-500"
                          }`}
                        >
                          <TrendingUp size={14} className={improvement < 0 ? "rotate-180" : ""} />
                          <span>
                            {improvement >= 0 ? "+" : ""}
                            {improvement}% Trend
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Avg Score</p>
                      <p className="text-2xl font-bold text-white">{topicAvg}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Best Score</p>
                      <p className="text-2xl font-bold text-indigo-400">{topicBest}%</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-3xl p-8 mb-8 border-white/5">
                  <div className="h-[250px] w-full">
                    <ProgressChart data={topicChartData} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {topicAttempts.map((attempt) => (
                    <Link
                      key={attempt.id}
                      href={`/results/${attempt.id}`}
                      className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-xl font-black text-white group-hover:text-indigo-400 w-12 text-center">{attempt.score}%</div>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 text-slate-400">
                            {attempt.level}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-1 font-medium italic">
                            {new Date(attempt.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-700 group-hover:text-white" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
