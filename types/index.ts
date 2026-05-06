export type ConceptScore = {
  concept: string;
  score: number;
};

export type ReportJson = {
  overall_feedback?: string;
  confidence_score?: number;
  evaluator_notes?: string[];
  strengths?: string[];
  weaknesses?: string[];
  concept_scores?: ConceptScore[];
  improvement_plan?: string[];
  next_7_day_plan?: string[];
};

export type AttemptResult = {
  score: number;
  report_json: ReportJson;
  topic_slug_snapshot: string | null;
  topics: { name: string } | { name: string }[] | null;
};

export type AttemptHistoryRow = {
  id: string;
  score: number | null;
  level: string;
  status: string;
  created_at: string;
  report_json: {
    concept_scores?: { concept: string; score: number }[];
  } | null;
  topics?:
    | {
        name?: string;
      }
    | {
        name?: string;
      }[]
    | null;
};

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_key?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

export type QAJsonType = {
  answer: string;
  feedback: string;
  question: string;
  score: number;
  rubric: {
    clarity: number;
    correctness: number;
    depth: number;
    tradeoff_awareness: number;
  };
};

export type ReplayAttempt = {
  report_json: ReportJson;
  qa_json: QAJsonType[];
  topics: {
    name: string;
  };
  score: number;
  level: string;
  track: string;
  duration_seconds: number;
};
