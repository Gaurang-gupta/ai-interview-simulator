import { getAttemptsWithTopicNames } from "@/actions/getAttempts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import HistoryAnalytics from "@/components/HistoryAnalytics";
import { AttemptHistoryRow } from "@/types";

export default async function HistoryPage() {
  const attempts = (await getAttemptsWithTopicNames()) as AttemptHistoryRow[];

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-5xl font-black text-white tracking-tight">
          Analytics Hub
        </h1>
      </div>

      <HistoryAnalytics attempts={attempts} />
    </div>
  );
}
