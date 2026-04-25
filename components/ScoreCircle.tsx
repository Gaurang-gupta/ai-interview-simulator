"use client";

import { useEffect, useState } from "react";

export default function ScoreCircle({ score }: { score: number }) {
    const [offset, setOffset] = useState(283); // Circumference of the circle
    const size = 200;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        // Animate the circle filling up
        const progressOffset = circumference - (score / 100) * circumference;
        const timer = setTimeout(() => setOffset(progressOffset), 100);
        return () => clearTimeout(timer);
    }, [score, circumference]);

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Track */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Animated Progress Bar */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="url(#circleGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white">{score}%</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mt-1">
                        Mastery
                    </span>
                </div>
            </div>

            {/* Performance Label */}
            <div className={`mt-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    score >= 50 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                        'bg-orange-500/10 border-orange-500/20 text-orange-400'
            }`}>
                {score >= 80 ? 'Exceptional' : score >= 50 ? 'Qualified' : 'Needs Review'}
            </div>
        </div>
    );
}