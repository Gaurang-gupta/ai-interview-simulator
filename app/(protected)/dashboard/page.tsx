"use client";

import Link from "next/link";
import { signOut } from "@/actions/authActions";
import {
    LogOut,
    History,
    Zap,
    ChevronRight,
    PlusCircle
} from "lucide-react";
import { topics } from "@/constants/topicList"

export default function DashboardPage() {
    return (
        <div className="min-h-screen pb-20">
            {/* Top Navigation Bar */}
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
                            A
                        </div>
                        <span className="font-bold tracking-tight text-white">AI PREP</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/history"
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <History size={16} />
                            History
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                {/* Welcome, Header */}
                <header className="mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Select a topic to generate a new AI-driven assessment.</p>
                </header>

                {/* Quick Stats / Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="glass p-4 rounded-2xl flex items-center gap-4 border-indigo-500/20">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ready to Start</p>
                            <p className="text-white font-semibold">10 Fresh Questions</p>
                        </div>
                    </div>
                    {/* Add more stats here if needed */}
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map((topic, index) => (
                        <Link key={topic.slug} href={`/topic/${topic.slug}`} className="group">
                            <div
                                className="glass h-full p-8 rounded-3xl transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-white/[0.05] group-hover:border-white/20 relative overflow-hidden"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Decorative background glow */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-white/20 transition-all">
                                    {topic.icon}
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                                    {topic.title}
                                    <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </h2>

                                <p className="text-slate-400 leading-relaxed">
                                    {topic.desc}
                                </p>

                                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlusCircle size={16} />
                                    Start New Attempt
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}