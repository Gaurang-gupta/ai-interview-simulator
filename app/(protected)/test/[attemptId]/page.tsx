"use client";

import { submitAnswers } from "@/actions/submitAnswers";
import { createClient } from "@/lib/supabase_client";
import { BrainCircuit, CheckCircle2, ChevronRight, Loader2, Timer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    SpeechRecognition?: new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
  }
}

type AttemptQuestionRecord = {
  question: string;
};

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

  const [loadState, setLoadState] = useState<LoadingState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchQuestions = async () => {
      setLoadState("loading");
      setLoadError(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("attempts")
          .select("qa_json")
          .eq("id", attemptId)
          .single();

        if (error) throw error;

        const questionRows = (data?.qa_json ?? []) as AttemptQuestionRecord[];
        const parsedQuestions = questionRows
          .map((row) => row.question?.trim())
          .filter((question): question is string => Boolean(question));

        if (!isMounted) return;

        if (parsedQuestions.length === 0) {
          setLoadState("error");
          setLoadError("No questions were found for this attempt.");
          return;
        }

        setQuestions(parsedQuestions);
        setAnswers(new Array(parsedQuestions.length).fill(""));
        setCurrentQuestionIndex(0);
        setStartedAt(Date.now());
        setElapsedSeconds(0);
        setLoadState("ready");
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setLoadState("error");
        setLoadError("We could not load your interview questions. Please refresh and try again.");
      }
    };

    void fetchQuestions();

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  useEffect(() => {
    if (loadState !== "ready" || startedAt === null) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [loadState, startedAt]);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [currentQuestionIndex, questions.length]);

  const currentAnswer = answers[currentQuestionIndex] ?? "";
  const currentAnswerLength = currentAnswer.trim().length;
  const secondsRemaining = Math.max(0, MIN_THINKING_SECONDS - elapsedSeconds);
  const canSubmitByTime = elapsedSeconds >= MIN_THINKING_SECONDS;

  const updateCurrentAnswer = (nextValue: string) => {
    setAnswers((prevAnswers) => {
      const nextAnswers = [...prevAnswers];
      nextAnswers[currentQuestionIndex] = nextValue;
      return nextAnswers;
    });
    setSubmitError(null);
  };

  const handleVoiceInput = () => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError("Voice mode is not supported in this browser.");
      return;
    }

    setVoiceError(null);
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      const merged = currentAnswer ? `${currentAnswer} ${transcript}` : transcript;
      updateCurrentAnswer(merged);
    };

    recognition.onerror = () => {
      setVoiceError("Could not capture voice input. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const goToPrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const handleSubmit = async () => {
    if (!canSubmitByTime) {
      setSubmitError(`Please spend at least ${MIN_THINKING_SECONDS} seconds before submitting.`);
      return;
    }

    const firstInvalidIndex = answers.findIndex((answer) => answer.trim().length < MIN_ANSWER_LENGTH);
    if (firstInvalidIndex >= 0) {
      setCurrentQuestionIndex(firstInvalidIndex);
      setSubmitError(`Answer ${firstInvalidIndex + 1} must be at least ${MIN_ANSWER_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitAnswers(attemptId, answers);
      router.push(`/results/${attemptId}`);
    } catch (error) {
      console.error(error);
      setSubmitError("Could not submit answers. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loadState === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="animate-pulse text-slate-400">Initializing AI assessment...</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-rose-500/40 bg-rose-500/5 p-6 text-center">
          <h1 className="text-xl font-semibold text-rose-200">Unable to load assessment</h1>
          <p className="mt-2 text-sm text-rose-100/90">{loadError}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <div className="flex w-full max-w-4xl flex-1 flex-col">
        <header className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Evaluation</h2>
                <p className="text-sm text-slate-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm text-slate-500 md:flex">
              <Timer size={16} />
              <span>{formatElapsed(elapsedSeconds)}</span>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8">
          <div className="glass relative overflow-hidden rounded-3xl p-8 shadow-2xl shadow-indigo-500/5 md:p-12">
            <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />

            <h3 className="mb-8 text-xl font-medium leading-relaxed text-slate-100 md:text-2xl">
              {questions[currentQuestionIndex]}
            </h3>

            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={voiceMode}
                    onChange={(event) => setVoiceMode(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/30"
                  />
                  Voice response mode
                </label>
                {voiceMode && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isListening}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-60"
                  >
                    {isListening ? "Listening..." : "Dictate Answer"}
                  </button>
                )}
              </div>

              <textarea
                value={currentAnswer}
                onChange={(event) => updateCurrentAnswer(event.target.value)}
                placeholder="Type your detailed response here..."
                className="h-64 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-6 leading-relaxed text-slate-200 placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <div className="absolute bottom-4 right-4 font-mono text-xs text-slate-600">Character Count: {currentAnswer.length}</div>
            </div>
            {voiceError && <p className="mt-2 text-xs text-amber-400">{voiceError}</p>}

            {currentAnswerLength < MIN_ANSWER_LENGTH && (
              <p className="mt-3 text-xs text-amber-400">
                Minimum {MIN_ANSWER_LENGTH} characters is required for final submission.
              </p>
            )}

            {submitError && <p className="mt-3 text-sm text-rose-400">{submitError}</p>}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                currentQuestionIndex === 0
                  ? "pointer-events-none opacity-0"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={goToNext}
                className="group flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-black transition-all hover:bg-slate-200"
              >
                Next Question
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmitByTime}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
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

          {!canSubmitByTime && (
            <p className="text-right text-xs text-amber-400">You can submit in {secondsRemaining}s.</p>
          )}
        </main>
      </div>
    </div>
  );
}
