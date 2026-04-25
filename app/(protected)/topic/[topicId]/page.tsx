"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { generateQuestions } from "@/actions/generateQuestions";
import { getLevelStatus } from "@/actions/getLevelStatus";
import { ArrowLeft, Trophy, Lock, Zap, Star, Loader2 } from "lucide-react";
import Link from "next/link";

type LevelStatus = {
  beginner: boolean;
  intermediate: boolean;
  advanced: boolean;
  scores: {
    beginner: number;
    intermediate: number;
  };
};

export default function TopicPage() {
  const router = useRouter();
  const params = useParams<{ topicId: string }>();
  const topicSlug = params.topicId;

  const [levels, setLevels] = useState<LevelStatus | null>(null);
  const [loadingLevel, setLoadingLevel] = useState<string | null>(null);

  useEffect(() => {
    getLevelStatus(topicSlug).then(setLevels);
  }, [topicSlug]);

  const handleStart = async (level: string) => {
    setLoadingLevel(level);
    try {
      const res = await generateQuestions(topicSlug, level);
      router.push(`/test/${res.attemptId}`);
    } catch (error) {
      console.error("Failed to generate questions", error);
      setLoadingLevel(null);
    }
  };

  if (!levels) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  const levelData = [
    {
      id: "beginner",
      label: "Beginner",
      unlocked: true,
      score: levels.scores.beginner,
      icon: <Star size={24} className="text-emerald-400" />,
      desc: "Fundamental concepts and core terminology.",
    },
    {
      id: "intermediate",
      label: "Intermediate",
      unlocked: levels.intermediate,
      score: levels.scores.intermediate,
      icon: <Zap size={24} className="text-blue-400" />,
      desc: "Practical application and deeper logic.",
    },
    {
      id: "advanced",
      label: "Advanced",
      unlocked: levels.advanced,
      score: undefined,
      icon: <Trophy size={24} className="text-purple-400" />,
      desc: "Complex scenarios and system-level thinking.",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white capitalize tracking-tight">
                {topicSlug.replace("-", " ")}
              </h1>
              <p className="text-slate-400 mt-2 text-lg">Challenge yourself and move up the ranks.</p>
            </div>

            <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Progress</p>
                <p className="text-white font-semibold">
                  Level {levels.advanced ? "3" : levels.intermediate ? "2" : "1"} of 3
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
          {levelData.map((lvl) => (
            <div
              key={lvl.id}
              className={`relative group rounded-3xl transition-all duration-300 ${
                lvl.unlocked
                  ? "glass p-8 cursor-pointer hover:scale-[1.02] hover:bg-white/[0.05] hover:border-white/20"
                  : "bg-white/[0.02] border border-white/5 p-8 opacity-60 grayscale"
              }`}
              onClick={() => lvl.unlocked && !loadingLevel && handleStart(lvl.id)}
            >
              {!lvl.unlocked && (
                <div className="absolute top-6 right-6 text-slate-500">
                  <Lock size={20} />
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center border border-white/10 ${
                  lvl.unlocked ? "bg-white/5" : "bg-transparent"
                }`}
              >
                {lvl.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{lvl.label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{lvl.desc}</p>

              <div className="mt-auto">
                {lvl.unlocked ? (
                  <button
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      loadingLevel === lvl.id ? "bg-slate-700 text-slate-300" : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {loadingLevel === lvl.id ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Generating...
                      </>
                    ) : lvl.score !== undefined ? (
                      `Retry (Best: ${lvl.score}%)`
                    ) : (
                      "Start Level"
                    )}
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-white/5 text-slate-500 font-bold text-center border border-white/5">
                    Locked
                  </div>
                )}
              </div>

              {lvl.unlocked && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
