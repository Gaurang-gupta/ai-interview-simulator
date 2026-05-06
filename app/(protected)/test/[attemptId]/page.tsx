"use client";

import { submitAnswers } from "@/actions/submitAnswers";
import { createClient } from "@/lib/supabase_client";
import { AlertCircle, BrainCircuit, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Timer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Constants ---
const MIN_ANSWER_LENGTH = 20;
const MIN_THINKING_SECONDS = 60;
type LoadingState = "loading" | "ready" | "error";

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function TestPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();

  // Core State
  const [loadState, setLoadState] = useState<LoadingState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);

  // 1. Fetch Questions on Mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("attempts")
          .select("qa_json")
          .eq("id", attemptId)
          .single();

        if (error) throw error;
        const parsedQuestions = (data?.qa_json ?? [])
          .map((row: any) => row.question?.trim())
          .filter(Boolean);

        if (parsedQuestions.length === 0)
          throw new Error("No questions found.");

        setQuestions(parsedQuestions);
        setAnswers(new Array(parsedQuestions.length).fill(""));
        setStartedAt(Date.now());
        setLoadState("ready");
      } catch (err) {
        setLoadState("error");
        setLoadError("We could not load your interview questions.");
      }
    };
    fetchQuestions();
  }, [attemptId]);

  // 2. Timer
  useEffect(() => {
    if (loadState !== "ready" || !startedAt) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [loadState, startedAt, completedAt]);

  const updateCurrentAnswer = (val: string) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = val;
      return newAnswers;
    });
    setSubmitError(null);
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const canSubmitByTime = elapsedSeconds >= MIN_THINKING_SECONDS;

  const handleSubmit = async () => {
    if (!canSubmitByTime) return;

    // Validate all answers before final submission
    const firstInvalid = answers.findIndex(
      (a) => a.trim().length < MIN_ANSWER_LENGTH,
    );
    if (firstInvalid >= 0) {
      setCurrentQuestionIndex(firstInvalid);
      setSubmitError(
        `Response ${firstInvalid + 1} is too short (min ${MIN_ANSWER_LENGTH} chars).`,
      );
      return;
    }

    setIsSubmitting(true);
    const finalTime = Math.floor((Date.now() - (startedAt ?? 0)) / 1000);
    setCompletedAt(Date.now());
    setElapsedSeconds(finalTime);
    try {
      await submitAnswers(attemptId, answers, finalTime);
      router.push(`/results/${attemptId}`);
    } catch {
      setSubmitError("Submission failed. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  if (loadState === "loading") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#030712]">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-xs">
          Initializing Session
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#030712] px-6">
        <div className="glass p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center max-w-md">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={40} />
          <h2 className="text-white font-bold text-xl mb-2">Setup Error</h2>
          <p className="text-slate-400 text-sm mb-6">{loadError}</p>
          <button
            onClick={() => router.refresh()}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 px-6 py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* HEADER */}
        <header className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <BrainCircuit size={14} /> AI Technical Assessment
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Question {currentQuestionIndex + 1}{" "}
                <span className="text-slate-600 font-medium text-xl ml-1">
                  / {questions.length}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <Timer size={16} className="text-indigo-400" />
              <span className="font-mono text-sm font-bold text-slate-300">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* QUESTION CARD */}
        <main className="flex flex-col gap-6">
          <div className="glass rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600/50" />

            <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-10 text-white">
              {questions[currentQuestionIndex]}
            </h2>

            <div className="relative">
              <textarea
                value={answers[currentQuestionIndex]}
                onChange={(e) => updateCurrentAnswer(e.target.value)}
                placeholder="Type your technical response here..."
                className="w-full h-72 bg-black/40 border border-white/10 rounded-3xl p-8 text-slate-300 focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none outline-none text-lg leading-relaxed placeholder:text-slate-700"
              />

              <div className="absolute bottom-6 left-8">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${answers[currentQuestionIndex].length >= MIN_ANSWER_LENGTH ? "text-emerald-500" : "text-slate-600"}`}
                >
                  Chars: {answers[currentQuestionIndex].length} /{" "}
                  {MIN_ANSWER_LENGTH}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 flex items-center gap-2 text-rose-500 text-sm font-bold animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} /> {submitError}
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <div className="flex justify-between items-center px-2">
            <button
              onClick={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors disabled:opacity-0 font-bold uppercase text-xs tracking-widest"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((p) => p + 1)}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Next Step{" "}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSubmitByTime}
                  className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Complete Session
                </button>
                {!canSubmitByTime && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-amber-500/80 uppercase tracking-widest">
                    Available in{" "}
                    {Math.max(0, MIN_THINKING_SECONDS - elapsedSeconds)}s
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
}
