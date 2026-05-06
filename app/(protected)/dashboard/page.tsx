"use client";

import Link from "next/link";
import { getTopics } from "@/actions/getTopics";
import { useEffect, useState } from "react";
import { TopicRecord } from "@/types";
import { getTopicIcon } from "@/lib/topicCatalog";
import { ChevronRight, Loader2, PlusCircle, Trophy, Zap } from "lucide-react";

export default function DashboardPage() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopics()
      .then((response) => setTopics(response))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Select a topic to generate a new AI-driven assessment.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="glass p-4 rounded-2xl flex items-center gap-4 border-indigo-500/20">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Ready to Start
              </p>
              <p className="text-white font-semibold">10 Fresh Questions</p>
            </div>
          </div>
          {/* NEW: Leaderboard Shortcut Card */}
          <Link href="/leaderboard" className="group">
            <div className="glass p-4 rounded-2xl flex items-center gap-4 border-amber-500/10 hover:border-amber-500/30 transition-all hover:bg-amber-500/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Trophy size={24} />{" "}
                {/* Ensure Trophy is imported from lucide-react */}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Competitive Rank
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">
                    Global Hall of Fame
                  </p>
                  <ChevronRight
                    size={14}
                    className="text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            Loading topics...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <Link
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                className="group"
              >
                <div
                  className="glass h-full p-8 rounded-3xl transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-white/[0.05] group-hover:border-white/20 relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-white/20 transition-all">
                    {getTopicIcon(topic.icon_key ?? undefined)}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                    {topic.name}
                    <ChevronRight
                      size={18}
                      className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                  </h2>

                  <p className="text-slate-400 leading-relaxed">
                    {topic.description ||
                      "Sharpen this topic with AI-guided practice."}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlusCircle size={16} />
                    Start New Attempt
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
