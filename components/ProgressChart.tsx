"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: { attempt: number; score: number; label: string }[];
};

export default function ProgressChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs italic">
        No data available
      </div>
    );
  }

  return (
    // Ensure the outer div has a physical height and relative positioning
    <div className="relative w-full h-full min-h-[150px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
      >
        {/* We use a unique key based on data length to force Recharts to recalculate sizing */}
        <LineChart
          key={`chart-${data.length}`}
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="attempt"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
            dy={10}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
            ticks={[0, 50, 100]} // Simplified ticks for cleaner look
          />

          <Tooltip
            cursor={{
              stroke: "#6366f1",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-950 border border-white/10 p-2 rounded-lg shadow-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                      {payload[0].payload.label}
                    </p>
                    <p className="text-sm font-black text-white">
                      Score:{" "}
                      <span className="text-indigo-400">
                        {payload[0].value}%
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#818cf8"
            strokeWidth={3}
            dot={{ fill: "#1e293b", stroke: "#818cf8", strokeWidth: 2, r: 4 }}
            activeDot={{
              r: 6,
              fill: "#fff",
              stroke: "#6366f1",
              strokeWidth: 2,
            }}
            animationDuration={1500}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
