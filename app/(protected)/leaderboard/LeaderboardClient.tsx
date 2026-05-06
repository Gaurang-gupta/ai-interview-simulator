"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Filter,
  Medal,
  Target,
  Timer,
  Trophy,
} from "lucide-react";

interface Entry {
  id: string;
  userEmail: string;
  topicName: string;
  level: string;
  score: number;
  duration: number;
  date: string;
}

export default function LeaderboardClient({
  initialData,
  topics,
  user,
}: {
  initialData: Entry[];
  topics: string[];
  user?: string;
}) {
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [selectedTopic, setSelectedTopic] = useState("Overall");

  const filteredData = useMemo(() => {
    // 1. First, filter by Level and Topic (if not Overall)
    const baseFiltered = initialData.filter((item) => {
      const levelMatch = item.level === selectedLevel;
      const topicMatch =
        selectedTopic === "Overall" || item.topicName === selectedTopic;
      return levelMatch && topicMatch;
    });

    // 2. Identify the BEST attempt per user for this specific selection
    const bestAttemptsMap = new Map<string, Entry>();

    baseFiltered.forEach((attempt) => {
      const existing = bestAttemptsMap.get(attempt.userEmail);

      if (!existing) {
        bestAttemptsMap.set(attempt.userEmail, attempt);
        return;
      }

      // Tie-breaker Logic:
      // Keep if: New Score > Old Score
      // OR: Scores are equal AND New Duration < Old Duration
      if (
        attempt.score > existing.score ||
        (attempt.score === existing.score &&
          attempt.duration < existing.duration)
      ) {
        bestAttemptsMap.set(attempt.userEmail, attempt);
      }
    });

    // 3. Convert Map back to Array and Sort for Ranking
    return Array.from(bestAttemptsMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.duration - b.duration;
    });
  }, [selectedLevel, selectedTopic, initialData]);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / (60 * 60)) > 0 ? Math.floor(s / (60 * 60)) : "";
    const mins = Math.floor(s / 60) > 0 ? Math.floor(s / 60) : "";
    const secs = s % 60;
    return `${hrs} ${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
              <Trophy size={14} /> Leaderboard
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
              Top <span className="text-indigo-500">Performers</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={14}
              />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all capitalize"
              >
                {["beginner", "intermediate", "advanced"].map((l) => (
                  <option key={l} value={l} className="bg-slate-900">
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                size={14}
              />
            </div>

            <div className="relative">
              <Target
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={14}
              />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              >
                {topics.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                size={14}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Rank
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    User Email
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Topic
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                    Score
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Duration
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 font-mono text-xs font-bold border border-white/5">
                        {idx < 3 ? (
                          <Medal
                            size={16}
                            className={
                              idx === 0
                                ? "text-yellow-500"
                                : idx === 1
                                  ? "text-slate-300"
                                  : "text-orange-700"
                            }
                          />
                        ) : (
                          idx + 1
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-200 text-sm">
                      {row.userEmail === user ? "You" : row.userEmail}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {row.topicName}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-lg font-black text-emerald-400">
                        {row.score}%
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Timer size={14} className="text-slate-600" />
                        {formatTime(row.duration)}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-600" />
                        {row.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
