"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase_client";
import { submitAnswers } from "@/actions/submitAnswers";
import { ChevronRight, Loader2, BrainCircuit, CheckCircle2, Timer } from "lucide-react";

type QARecord = {
  question: string;
};

const MIN_ANSWER_LENGTH = 20;
const MIN_THINKING_SECONDS = 60;

export default function TestPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;
  const router = useRouter();

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("attempts").select("qa_json").eq("id", attemptId).single();

      if (data?.qa_json) {
        const qs = (data.qa_json as QARecord[]).map((row) => row.question);
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(""));
      }
    };
    fetchQuestions();
  }, [attemptId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const handleChange = (value: string) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);
    setErrorMessage(null);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const handleSubmit = async () => {
    if (elapsedSeconds < MIN_THINKING_SECONDS) {
      setErrorMessage(`Please spend at least ${MIN_THINKING_SECONDS} seconds before submitting.`);
      return;
    }

    const firstInvalid = answers.findIndex((answer) => answer.trim().length < MIN_ANSWER_LENGTH);
    if (firstInvalid !== -1) {
      setCurrent(firstInvalid);
      setErrorMessage(`Answer ${firstInvalid + 1} must be at least ${MIN_ANSWER_LENGTH} characters.`);
      return;
    }
  };

  const handleSubmit = async () => {
    const firstInvalid = answers.findIndex((answer) => answer.trim().length < MIN_ANSWER_LENGTH);
    if (firstInvalid !== -1) {
      setCurrent(firstInvalid);
      setErrorMessage(`Answer ${firstInvalid + 1} must be at least ${MIN_ANSWER_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitAnswers(attemptId, answers);
      router.push(`/results/${attemptId}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setErrorMessage("Could not submit answers. Please try again.");
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-slate-400 animate-pulse">Initializing AI Assessment...</p>
      </div>
    );
  }

  const progress = ((current + 1) / questions.length) * 100;
  const currentLength = answers[current]?.trim().length ?? 0;
  const mins = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (elapsedSeconds % 60).toString().padStart(2, "0");

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-4xl flex flex-col flex-1">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">AI Evaluation</h2>
                <p className="text-slate-500 text-sm">
                  Question {current + 1} of {questions.length}
                </p>
              </div>
            </div>
                            <div className="hidden md:flex items-center gap-2 text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/5 text-sm">
                                <Timer size={16} />
                                <span>{mins}:{secs}</span>
                            </div>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <main className="flex-1 flex flex-col gap-8 animate-fade-in">
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

            <h3 className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed mb-8">{questions[current]}</h3>

            <div className="relative">
              <textarea
                value={answers[current]}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Type your detailed response here..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 h-64 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
                Character Count: {answers[current].length}
              </div>
            </div>
            {currentLength < MIN_ANSWER_LENGTH && (
              <p className="mt-3 text-xs text-amber-400">
                Minimum {MIN_ANSWER_LENGTH} characters recommended for meaningful evaluation.
              </p>
            )}
            {errorMessage && <p className="mt-3 text-sm text-rose-400">{errorMessage}</p>}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrevious}
              disabled={current === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                current === 0 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Previous
            </button>

            <div className="flex gap-4">
              {current < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="group flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Next Question
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || elapsedSeconds < MIN_THINKING_SECONDS}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing Results...
                    </>
                  ) : (
                    <>
                      Submit Final Answers
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          {elapsedSeconds < MIN_THINKING_SECONDS && (
            <p className="text-xs text-amber-400 text-right">
              You can submit in {MIN_THINKING_SECONDS - elapsedSeconds}s.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
