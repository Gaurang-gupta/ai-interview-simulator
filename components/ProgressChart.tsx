"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

type Props = {
    data: { attempt: number; score: number; label: string }[];
};

export default function ProgressChart({ data }: Props) {
    // Ensure we have data or a fallback to prevent render issues
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm italic">
                No data available for this trend.
            </div>
        );
    }

    return (
        // The key is having a defined height on this parent wrapper
        <div className="w-full h-full min-h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4 4"
                    />

                    <XAxis
                        dataKey="attempt"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 11 }}
                        dy={10}
                    />

                    <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 11 }}
                    />

                    <Tooltip
                        labelFormatter={(value) => `Attempt ${value}`}
                        formatter={(value, _name, payload) => [
                            `${typeof value === "number" ? value : 0}%`,
                            String(payload?.payload?.label ?? "Score"),
                        ]}
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="url(#scoreGradient)"
                        strokeWidth={3}
                        dot={{ fill: '#818cf8', r: 3, strokeWidth: 1, stroke: '#030712' }}
                        activeDot={{ r: 5, fill: '#fff' }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
