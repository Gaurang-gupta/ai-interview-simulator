import Link from "next/link";
import { ArrowRight, Sparkles, BrainCircuit, ShieldCheck } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center relative overflow-hidden">
            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center w-full max-w-5xl px-6 py-24 text-center z-10">

                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 animate-fade-in">
                    <Sparkles size={14} />
                    <span>Powered by Advanced AI</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 bg-clip-text bg-gradient-to-b from-white to-slate-400">
                    Master any topic with <br />
                    <span className="text-indigo-500">Intelligent Evaluation</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                    Generate custom assessments, track your conceptual progress, and receive
                    AI-driven feedback to accelerate your learning journey.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <Link
                        href="/dashboard"
                        className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-white font-semibold transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
                    >
                        Start Your First Test
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/login"
                        className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 text-white font-semibold transition-all hover:bg-white/10 hover:border-white/20"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                            <BrainCircuit size={20} />
                        </div>
                        <h3 className="text-white font-semibold mb-2">10-Question Precision</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Curated assessments designed to test the depth of your understanding in exactly 10 questions.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-white font-semibold mb-2">Detailed Feedback</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Get comprehensive scores, strength mapping, and a custom improvement plan for every attempt.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-white font-semibold mb-2">Progress History</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Every attempt is saved. Monitor your growth across different topics and difficulty levels.
                        </p>
                    </div>
                </div>
            </main>

            {/* Decorative radial gradient for the bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        </div>
    );
}