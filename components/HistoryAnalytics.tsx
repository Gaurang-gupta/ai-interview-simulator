"use client";

import ProgressChart from "@/components/ProgressChart";
import { AlertTriangle, Brain, ChevronRight, Target, TrendingUp } from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase_client";

type ConceptScore = {
  concept: string;
  score: number;
};

export type AttemptHistoryRow = {
  id: string;
  score: number | null;
  level: string;
  status: string;
  created_at: string;
  report_json: {
    concept_scores?: ConceptScore[];
  } | null;
  topics?:
    | {
        name?: string;
      }
    | {
        name?: string;
      }[]
    | null;
};

type Props = {
  attempts: AttemptHistoryRow[];
};

function toNumericScore(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function prettyConceptName(name: string) {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function HistoryAnalytics({ attempts }: Props) {
  const [viewMode, setViewMode] = useState<"topic" | "combined">("topic");
  const [isSending, setIsSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  useEffect(() => {
    const getRecipient = async () => {
      const supabase = await createClient();
      // Get the current session user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setRecipientEmail(user.email);
    };
    getRecipient();
  }, []);
  const getTopicName = (attempt: AttemptHistoryRow) => {
    if (!attempt.topics) return "General Assessment";
    if (Array.isArray(attempt.topics))
      return attempt.topics[0]?.name || "General Assessment";
    return attempt.topics.name || "General Assessment";
  };

  const completedAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.score !== null),
    [attempts],
  );

  const weakConcepts = useMemo(() => {
    const conceptAggregator: Record<string, { total: number; count: number }> =
      {};
    completedAttempts.forEach((attempt) => {
      const scores = attempt.report_json?.concept_scores ?? [];
      scores.forEach((cs) => {
        if (!conceptAggregator[cs.concept]) {
          conceptAggregator[cs.concept] = { total: 0, count: 0 };
        }
        conceptAggregator[cs.concept].total += toNumericScore(cs.score);
        conceptAggregator[cs.concept].count += 1;
      });
    });

    return Object.entries(conceptAggregator)
      .map(([name, stats]) => ({
        name,
        displayName: prettyConceptName(name),
        avg: Math.round(stats.total / stats.count),
      }))
      .filter((concept) => concept.avg < 75)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 4);
  }, [completedAttempts]);

  const groupedAttempts = useMemo(
    () =>
      completedAttempts.reduce<Record<string, AttemptHistoryRow[]>>(
        (acc, current) => {
          const topicName = getTopicName(current);
          if (!acc[topicName]) acc[topicName] = [];
          acc[topicName].push(current);
          return acc;
        },
        {},
      ),
    [completedAttempts],
  );

  const combinedChartData = useMemo(() => {
    return completedAttempts
      .slice()
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .map((attempt, index) => ({
        attempt: index + 1,
        score: attempt.score || 0,
        label: `${getTopicName(attempt)} · ${new Date(attempt.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}`,
      }));
  }, [completedAttempts]);

  const combinedAvg =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce(
            (sum, attempt) => sum + (attempt.score || 0),
            0,
          ) / completedAttempts.length,
        )
      : 0;
  const combinedBest =
    completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((attempt) => attempt.score || 0))
      : 0;
  const studyStreakDays = useMemo(() => {
    const uniqueDays = Array.from(
      new Set(
        completedAttempts.map((attempt) => attempt.created_at.slice(0, 10)),
      ),
    ).sort((a, b) => b.localeCompare(a));
    if (uniqueDays.length === 0) return 0;
    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);

    for (let index = 0; index < uniqueDays.length; index += 1) {
      const day = uniqueDays[index];
      const currentDay = new Date(day);
      currentDay.setUTCHours(0, 0, 0, 0);

      const diffDays = Math.round(
        (cursor.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (index === 0 && diffDays > 1) {
        return 0;
      }
      if (diffDays === 0) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else if (diffDays === 1 && streak === 0) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 2);
      } else {
        break;
      }
    }

    return streak;
  }, [completedAttempts]);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const weeklyAttempts = completedAttempts.filter(
      (attempt) => new Date(attempt.created_at) >= sevenDaysAgo,
    );

    const avgScore =
      weeklyAttempts.length > 0
        ? Math.round(
            weeklyAttempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),

              0,
            ) / weeklyAttempts.length,
          )
        : 0;

    return {
      attempts: weeklyAttempts.length,
      avgScore,
    };
  }, [completedAttempts]);

  const weeklyGoalTarget = 5;

  const weeklyGoalProgress = Math.min(
    100,
    Math.round((weeklySummary.attempts / weeklyGoalTarget) * 100),
  );

  const conceptMasterySeries = useMemo(() => {
    const conceptMap: Record<string, number[]> = {};
    completedAttempts
      .slice()
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .forEach((attempt) => {
        (attempt.report_json?.concept_scores ?? []).forEach(
          ({ concept, score }) => {
            if (!conceptMap[concept]) conceptMap[concept] = [];
            conceptMap[concept].push(score);
          },
        );
      });

    return Object.entries(conceptMap)
      .map(([concept, scores]) => ({
        concept,
        points: scores.map((score, index) => ({ attempt: index + 1, score })),
        latest: scores[scores.length - 1] ?? 0,
      }))
      .sort((a, b) => a.latest - b.latest)
      .slice(0, 3);
  }, [completedAttempts]);

  return (
    <>
      <div className="mb-8 flex items-center justify-end">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <button
            onClick={() => setViewMode("topic")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              viewMode === "topic"
                ? "bg-indigo-500/20 text-indigo-200"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Per Topic
          </button>

          <button
            onClick={() => setViewMode("combined")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              viewMode === "combined"
                ? "bg-indigo-500/20 text-indigo-200"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Combined
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Study Streak
          </p>

          <p className="text-2xl font-black text-emerald-300 mt-1">
            {studyStreakDays} day{studyStreakDays === 1 ? "" : "s"}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Consecutive calendar days with at least one completed session.
          </p>
        </div>

        <div className="glass rounded-2xl p-4 border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Weekly Summary
          </p>

          <p className="text-sm text-slate-300 mt-1">
            {weeklySummary.attempts} sessions in last 7 days · Avg{" "}
            {weeklySummary.avgScore}%
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Completion Goal
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {weeklySummary.attempts}/{weeklyGoalTarget} sessions this week
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            This goal counts sessions in the last 7 days (not unique days).
          </p>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${weeklyGoalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {weakConcepts.length > 0 && (
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-orange-400">
              <Brain size={20} />
              <h2 className="text-sm font-bold uppercase tracking-[0.3em]">
                Priority Knowledge Gaps
              </h2>
            </div>

            <span className="text-[10px] bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20 font-bold uppercase tracking-tighter">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakConcepts.map((concept) => (
              <div
                key={concept.name}
                className="group relative overflow-hidden glass p-6 rounded-3xl border-white/5 bg-gradient-to-br from-orange-500/[0.03] to-transparent hover:border-orange-500/30 transition-all duration-500"
              >
                {/* Background Decorative Icon */}

                <div className="absolute -right-4 -bottom-4 text-orange-500/5 group-hover:text-orange-500/10 transition-colors">
                  <AlertTriangle size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h3 className="text-white font-black text-lg tracking-tight group-hover:text-orange-300 transition-colors">
                        {concept.displayName}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium italic">
                        Requires immediate technical review
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-orange-400 tracking-tighter">
                        {concept.avg}%
                      </span>

                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                        Avg Mastery
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">
                        Current Proficiency
                      </span>

                      <span className="text-orange-500">Target: 75%+</span>
                    </div>

                    <div className="w-full bg-white/5 h-3 rounded-full p-0.5 border border-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                        style={{ width: `${concept.avg}%` }}
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        Focus on Internals
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conceptMasterySeries.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {conceptMasterySeries.map((series) => (
            <div
              key={series.concept}
              className="glass rounded-3xl border border-white/10 bg-white/[0.01] p-5 flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 mb-1">
                    Concept Mastery
                  </p>

                  <h3 className="text-white font-bold text-sm tracking-tight">
                    {prettyConceptName(series.concept)}
                  </h3>
                </div>

                <div className="bg-indigo-500/10 px-2 py-1 rounded-md">
                  <span className="text-xs font-black text-indigo-400">
                    {series.latest}%
                  </span>
                </div>
              </div>

              <div className="mt-auto w-full h-[180px]">
                <ProgressChart
                  data={series.points.map((point) => ({
                    attempt: point.attempt,
                    score: point.score,
                    label: `Attempt ${point.attempt}`,
                  }))}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {completedAttempts.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center border border-white/5">
          <p className="text-slate-400 text-sm">
            No completed attempts yet. Finish one interview to unlock analytics.
          </p>
        </div>
      )}

      {viewMode === "combined" ? (
        <section className="animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                All Topics
              </h2>

              <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                <Target size={14} className="text-indigo-500" />
                {completedAttempts.length} Completed Sessions
              </p>
            </div>

            <div className="flex gap-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Avg Score
                </p>

                <p className="text-2xl font-bold text-white">{combinedAvg}%</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Best Score
                </p>

                <p className="text-2xl font-bold text-indigo-400">
                  {combinedBest}%
                </p>
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
              improvement =
                (topicAttempts[0].score || 0) - (topicAttempts[1].score || 0);
            }

            const topicBest = Math.max(
              ...topicAttempts.map((attempt) => attempt.score || 0),
            );

            const topicAvg = Math.round(
              topicAttempts.reduce(
                (sum, attempt) => sum + (attempt.score || 0),

                0,
              ) / topicAttempts.length,
            );

            const topicChartData = topicAttempts

              .slice()

              .reverse()

              .map((attempt, index) => ({
                attempt: index + 1,

                score: attempt.score || 0,

                label: new Date(attempt.created_at).toLocaleDateString(
                  "en-US",

                  { dateStyle: "medium" },
                ),
              }));

            return (
              <section key={topicName} className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white capitalize tracking-tight">
                      {topicName}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <Target size={14} className="text-indigo-500" />
                        {topicAttempts.length} Total Sessions
                      </p>

                      {topicAttempts.length >= 2 && (
                        <div
                          className={`flex items-center gap-1 text-xs font-black uppercase tracking-wider ${
                            improvement >= 0
                              ? "text-emerald-400"
                              : "text-rose-500"
                          }`}
                        >
                          <TrendingUp
                            size={14}
                            className={improvement < 0 ? "rotate-180" : ""}
                          />

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
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Avg Score
                      </p>

                      <p className="text-2xl font-bold text-white">
                        {topicAvg}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Best Score
                      </p>

                      <p className="text-2xl font-bold text-indigo-400">
                        {topicBest}%
                      </p>
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
                        <div className="text-xl font-black text-white group-hover:text-indigo-400 w-12 text-center">
                          {attempt.score}%
                        </div>

                        <div className="h-8 w-[1px] bg-white/10" />

                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 text-slate-400">
                            {attempt.level}
                          </span>

                          <p className="text-[11px] text-slate-600 mt-1 font-medium italic">
                            {new Date(attempt.created_at).toLocaleDateString(
                              "en-US",

                              { dateStyle: "medium" },
                            )}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-700 group-hover:text-white"
                      />
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
