"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Lightbulb,
  Target,
  Trophy,
} from "lucide-react";
import { ReplayAttempt } from "@/types";
import PDFDownloadButton from "@/components/PDFDownloadButton";

// --- Sub-component: Rubric Radar Stat ---
const RubricStat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-end">
      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
        {label}
      </span>
      <span className="text-[10px] font-mono text-slate-400">{value}/100</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-indigo-500" : "bg-rose-500"}`}
      />
    </div>
  </div>
);

export default function ReplayClientView({
  attempt,
}: {
  attempt: ReplayAttempt;
}) {
  const { report_json, qa_json, topics, score, level } = attempt;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-24 pb-32 pt-10"
      id="report-content"
    >
      {/* --- 1. THE HERO DIAGNOSTIC --- */}
      <motion.section variants={itemVariants} className="text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          <Activity size={12} className="animate-pulse" /> Diagnostic Complete
        </div>
        <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-none mb-6 select-none italic text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
          {score}
          <span className="text-indigo-500 text-4xl md:text-6xl">%</span>
        </h1>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {/* Topic Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Topic
              </span>
              <span className="text-sm font-bold text-indigo-400 capitalize">
                {topics.name}
              </span>
            </div>

            {/* Separator Dot (Hidden on mobile) */}
            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-800" />

            {/* Level Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Level
              </span>
              <span className="text-sm font-bold text-indigo-400 capitalize">
                {level}
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed">
            {report_json.overall_feedback}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <PDFDownloadButton attempt={attempt} />
        </div>
      </motion.section>

      {/* --- 2. TRUTH GRID (STRENGTHS/WEAKNESSES) --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        <motion.div
          variants={itemVariants}
          className="p-8 rounded-[2.5rem] bg-emerald-500/[0.02] border border-emerald-500/10 hover:bg-emerald-500/[0.04] transition-colors"
        >
          <div className="flex items-center gap-3 text-emerald-400 mb-8 font-black uppercase tracking-widest text-[10px]">
            <Trophy size={16} /> Technical Strengths
          </div>
          <ul className="space-y-5">
            {report_json.strengths?.map((s, i) => (
              <li
                key={i}
                className="flex gap-4 text-slate-300 text-sm leading-relaxed group"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-8 rounded-[2.5rem] bg-rose-500/[0.02] border border-rose-500/10 hover:bg-rose-500/[0.04] transition-colors"
        >
          <div className="flex items-center gap-3 text-rose-400 mb-8 font-black uppercase tracking-widest text-[10px]">
            <Target size={16} /> Critical Gaps
          </div>
          <ul className="space-y-5">
            {report_json.weaknesses?.map((w, i) => (
              <li
                key={i}
                className="flex gap-4 text-slate-300 text-sm leading-relaxed group"
              >
                <div className="h-5 w-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-500/20 transition-colors">
                  <AlertCircle size={12} className="text-rose-500" />
                </div>
                {w}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* --- 3. ITEM-BY-ITEM QA FEED (FULL ANSWERS) --- */}
      <section className="space-y-12 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
            Atomic Breakdown
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Full question-by-question technical rubric
          </p>
        </div>

        <div className="space-y-12">
          {qa_json.map((q, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="overflow-hidden rounded-[2.5rem] border bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-500"
            >
              <div className="p-8 md:p-12">
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Rubric Info (Left Column) */}
                  <div className="lg:w-1/3 space-y-6">
                    <div className="flex justify-between items-start">
                      <div
                        className={`text-5xl font-black italic tracking-tighter ${q.score >= 80 ? "text-emerald-400" : q.score >= 50 ? "text-indigo-400" : "text-rose-500"}`}
                      >
                        {q.score}%
                      </div>
                      <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Question {i + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-tight">
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-5 pt-6 border-t border-white/10">
                      <RubricStat label="Clarity" value={q.rubric.clarity} />
                      <RubricStat
                        label="Correctness"
                        value={q.rubric.correctness}
                      />
                      <RubricStat label="Depth" value={q.rubric.depth} />
                      <RubricStat
                        label="Tradeoffs"
                        value={q.rubric.tradeoff_awareness}
                      />
                    </div>
                  </div>

                  {/* Content (Right Column) */}
                  <div className="lg:w-2/3 space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={12} /> Full User Submission
                      </p>
                      <div className="rounded-2xl bg-black/40 border border-white/5 p-8 shadow-inner">
                        <p className="text-slate-300 text-[15px] font-mono leading-relaxed whitespace-pre-wrap">
                          {q.answer}
                        </p>
                      </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/10 relative overflow-hidden group">
                      {/* Subtle background glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors" />

                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Lightbulb size={14} /> AI Analysis & Feedback
                      </p>
                      <p className="text-slate-200 text-[15px] leading-relaxed">
                        {q.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- 4. EVALUATOR NOTES --- */}
      {report_json.evaluator_notes && (
        <motion.section variants={itemVariants} className="px-4">
          <div className="max-w-4xl mx-auto p-12 md:p-16 rounded-[3.5rem] bg-white/[0.02] border border-white/5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-12 text-center">
              Auditor Review Summary
            </h2>
            <div className="grid gap-6">
              {report_json.evaluator_notes.map((note, i) => (
                <div
                  key={i}
                  className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors items-start"
                >
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-500 shrink-0 mt-1">
                    {i + 1}
                  </div>
                  <p className="text-slate-400 text-[15px] italic leading-relaxed">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* --- 5. THE 7-DAY ROADMAP --- */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="relative overflow-hidden p-[1px] bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-emerald-500/30 rounded-[4rem]">
          <div className="bg-[#050505] rounded-[3.9rem] p-12 md:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] -z-10" />

            <div className="text-center mb-20 space-y-6">
              <div className="h-24 w-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-400 mx-auto mb-10 shadow-2xl shadow-indigo-500/20">
                <Calendar size={40} />
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight italic">
                Evolutionary Protocol
              </h2>
              <p className="text-slate-500 text-xl max-w-xl mx-auto font-medium">
                Your next 168 hours of calculated technical improvement.
              </p>
            </div>

            <div className="max-w-2xl mx-auto grid gap-4">
              {report_json.next_7_day_plan?.map((day, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-8 p-7 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default"
                >
                  <div className="text-indigo-500 font-black text-sm uppercase tracking-tighter opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    0{i + 1}
                  </div>
                  <p className="text-slate-300 text-base font-medium leading-tight">
                    {day}
                  </p>
                  <ArrowRight
                    size={18}
                    className="ml-auto text-slate-800 group-hover:text-indigo-500 transition-all group-hover:translate-x-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
