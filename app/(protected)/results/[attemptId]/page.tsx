import { createServerSupabaseClient } from "@/lib/supabase_server";
import {
    Trophy,
    Target,
    TrendingUp,
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Lightbulb,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import ScoreCircle from "@/components/ScoreCircle";

export default async function ResultsPage({ params }: { params: { attemptId: string } }) {
    const supabase = await createServerSupabaseClient();
    const { attemptId } = await params;

    const { data } = await supabase
        .from("attempts")
        .select(`
            *,
            topics (
                name
            )
        `)
        .eq("id", attemptId)
        .single();

    if (!data) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="glass p-8 rounded-3xl text-center">
                    <p className="text-slate-400">Failed to load result data.</p>
                </div>
            </div>
        );
    }

    const report = data.report_json;
    const topicName = data.topics?.name || "Technical Assessment";

    return (
        <div className="min-h-screen px-6 py-12 bg-[#030712]">
            <div className="max-w-5xl mx-auto">

                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to History
                    </Link>
                </div>

                {/* Hero Section with ScoreCircle */}
                <div className="flex flex-col items-center text-center mb-16 animate-fade-in">
                    <ScoreCircle score={data.score} />

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-6">
                        Analysis: <span className="text-indigo-500 capitalize">{topicName}</span>
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg max-w-2xl">
                        We've analyzed your responses. Here is a breakdown of your technical proficiency and a roadmap for improvement.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Feedback Column */}
                    <div className="lg:col-span-2 space-y-8 animate-slide-up">

                        {/* Strengths Card */}
                        <section className="glass rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CheckCircle2 size={120} />
                            </div>
                            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2 tracking-tight">
                                <Target size={22} /> Key Strengths
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report?.strengths?.map((s: string, i: number) => (
                                    <li key={i} className="flex gap-4 text-slate-300 bg-white/[0.03] p-5 rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                        </div>
                                        <span className="text-sm leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Weaknesses Card */}
                        <section className="glass rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-red-500">
                                <AlertCircle size={120} />
                            </div>
                            <h2 className="text-xl font-bold text-orange-400 mb-6 flex items-center gap-2 tracking-tight">
                                <AlertCircle size={22} /> Growth Opportunities
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report?.weaknesses?.map((w: string, i: number) => (
                                    <li key={i} className="flex gap-4 text-slate-300 bg-white/[0.03] p-5 rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                            <AlertCircle size={14} className="text-orange-500" />
                                        </div>
                                        <span className="text-sm leading-relaxed">{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <aside className="space-y-6 animate-slide-up" style={{ animationDelay: "150ms" }}>

                        {/* Mastery Plan */}
                        <section className="glass rounded-[2rem] p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.05] to-transparent shadow-2xl shadow-indigo-500/5">
                            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <TrendingUp size={22} className="text-indigo-400" /> Mastery Plan
                            </h2>
                            <div className="space-y-6">
                                {report?.improvement_plan?.map((p: string, i: number) => (
                                    <div key={i} className="relative pl-8">
                                        <div className="absolute left-0 top-0 w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{p}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
                                <Lightbulb size={24} className="text-yellow-500 mb-3" />
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    "Consistently following this plan increases mastery retention by 40%."
                                </p>
                            </div>
                        </section>

                        <Link
                            href={`/topic/${data.topic_id}`}
                            className="flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
                        >
                            <RefreshCw size={18} />
                            Retry Lab
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}