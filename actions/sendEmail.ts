"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type StatType = {
  attempts: number;
  avgScore: number;
  streak: number;
  gaps: {
    name: string;
    displayName: string;
    avg: number;
  }[];
};

export async function sendWeeklyReport(email: string, stats: StatType) {
  try {
    const { data, error } = await resend.emails.send({
      from: "AI Prep <onboarding@resend.dev>", // Use your verified domain here later
      to: [email],
      subject: `Learning Progress Report: ${new Date().toLocaleDateString()}`,
      html: `
        <h1>Weekly Performance Summary</h1>
        <p><strong>Sessions:</strong> ${stats.attempts} / 5</p>
        <p><strong>Avg Score:</strong> ${stats.avgScore}%</p>
        <p><strong>Streak:</strong> ${stats.streak} days</p>
        <h3>Priority Knowledge Gaps</h3>
        <ul>
          ${stats.gaps.map((g: any) => `<li>${g.displayName}: ${g.avg}%</li>`).join("")}
        </ul>
      `,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
