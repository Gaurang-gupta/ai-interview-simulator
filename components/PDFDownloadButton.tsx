"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText, Loader2 } from "lucide-react";
import { AssessmentPDF } from "./AssessmentPDF";
import { ReplayAttempt } from "@/types";

export default function PDFDownloadButton({
  attempt,
}: {
  attempt: ReplayAttempt;
}) {
  const [isClient, setIsClient] = useState(false);

  // Fixes the "window is not defined" or "Web specific API" error
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-900/50 text-white/50 font-bold cursor-not-allowed">
        <Loader2 className="animate-spin" size={20} />
        <span>Initializing...</span>
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<AssessmentPDF attempt={attempt} />}
      fileName={`Assessment_${attempt.topics.name}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-2xl disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <FileText size={20} />
          )}
          <span>{loading ? "Preparing PDF..." : "Download PDF Report"}</span>
        </button>
      )}
    </PDFDownloadLink>
  );
}
