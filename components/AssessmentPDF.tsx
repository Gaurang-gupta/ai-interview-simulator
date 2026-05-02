import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ReplayAttempt } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontFamily: "Helvetica",
  },
  // --- Header Section ---
  header: {
    borderBottom: "2 solid #E5E7EB",
    paddingBottom: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // --- Score Summary ---
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  overallText: {
    fontSize: 10,
    color: "#374151",
    width: "70%",
    lineHeight: 1.5,
  },
  // --- QA Item ---
  qaItem: {
    marginBottom: 40,
  },
  questionHeader: {
    backgroundColor: "#111827",
    padding: "10 15",
    borderRadius: 4,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  rubricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  pill: {
    backgroundColor: "#EEF2FF",
    border: "1 solid #E0E7FF",
    padding: "4 8",
    borderRadius: 4,
  },
  pillText: {
    fontSize: 8,
    color: "#4338CA",
    fontWeight: "bold",
  },
  blockTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 10,
  },
  responseBox: {
    padding: 12,
    borderLeft: "3 solid #E5E7EB",
    backgroundColor: "#FDFDFD",
    marginBottom: 10,
  },
  responseText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
  },
  feedbackBox: {
    padding: 12,
    backgroundColor: "#F5F3FF",
    borderRadius: 6,
    border: "1 solid #EDE9FE",
  },
  feedbackText: {
    fontSize: 10,
    color: "#5B21B6",
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  // --- Roadmap Section ---
  roadmapContainer: {
    marginTop: 20,
    paddingTop: 30,
    borderTop: "2 solid #4F46E5",
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottom: "1 solid #F3F4F6",
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4F46E5",
    width: 60,
  },
  dayPlan: {
    fontSize: 10,
    color: "#374151",
    flex: 1,
    lineHeight: 1.4,
  },
});

export const AssessmentPDF = ({ attempt }: { attempt: ReplayAttempt }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 1. DOCUMENT HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Technical Assessment Report</Text>
        <Text style={styles.subtitle}>
          {attempt.topics.name} • {attempt.level} Level •{" "}
          {new Date().toLocaleDateString()}
        </Text>
      </View>

      {/* 2. SCORE & FEEDBACK */}
      <View style={styles.scoreRow}>
        <View>
          <Text style={{ fontSize: 10, color: "#6B7280" }}>Overall Score</Text>
          <Text style={styles.scoreBig}>{attempt.score}%</Text>
        </View>
        <Text style={styles.overallText}>
          {attempt.report_json.overall_feedback}
        </Text>
      </View>

      {/* 3. QA FEED */}
      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 20 }}>
        Question Analysis
      </Text>
      {attempt.qa_json.map((q, i) => (
        <View key={i} style={styles.qaItem} wrap={true}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>
              Question {i + 1}: {q.question}
            </Text>
          </View>

          <View style={styles.rubricRow}>
            <View style={[styles.pill, { backgroundColor: "#ECFDF5" }]}>
              <Text style={[styles.pillText, { color: "#065F46" }]}>
                SCORE: {q.score}%
              </Text>
            </View>
            {Object.entries(q.rubric).map(([key, val]) => (
              <View key={key} style={styles.pill}>
                <Text style={styles.pillText}>
                  {key.toUpperCase()}: {val as number}/100
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.blockTitle}>Candidate Response</Text>
          <View style={styles.responseBox}>
            <Text style={styles.responseText}>{q.answer}</Text>
          </View>

          <Text style={styles.blockTitle}>Evaluation & Feedback</Text>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{q.feedback}[cite: 2]</Text>
          </View>
        </View>
      ))}

      {/* 4. EVOLUTIONARY PROTOCOL (Next 7 Day Plan) */}
      <View style={styles.roadmapContainer} wrap={false}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#111827",
            marginBottom: 15,
          }}
        >
          Evolutionary Protocol: 7-Day Improvement Plan
        </Text>
        {attempt.report_json.next_7_day_plan?.map((plan, i) => (
          <View key={i} style={styles.dayRow}>
            <Text style={styles.dayLabel}>0{i + 1}</Text>
            <Text style={styles.dayPlan}>{plan}[cite: 2]</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
