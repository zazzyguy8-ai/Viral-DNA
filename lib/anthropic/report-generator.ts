import { anthropic } from "./client";

export interface ReportInput {
  weekStart: string;
  weekEnd: string;
  dnaScore?: number | null;
  niche?: string;
  platform?: string;
  contentStyle?: string;
  ideasGeneratedCount: number;
  competitorsTracked: number;
  topViralPatterns?: string[];
  contentPillars?: string[];
}

export interface WeeklyReport {
  overall_assessment: string;
  wins: string[];
  losses: string[];
  growth_opportunities: string[];
  recommended_actions: Array<{
    action: string;
    priority: "high" | "medium" | "low";
    impact: string;
  }>;
  weekly_focus: string;
  content_plan: Array<{
    day: string;
    format: string;
    topic: string;
  }>;
  mindset_note: string;
}

export async function generateWeeklyReport(input: ReportInput): Promise<WeeklyReport> {
  const prompt = `You are an elite creator growth coach. Generate a personalized weekly growth report.

Creator context:
- Week: ${input.weekStart} to ${input.weekEnd}
- Platform: ${input.platform ?? "not specified"}
- Niche: ${input.niche ?? "not specified"}
- Viral DNA Score: ${input.dnaScore ?? "not yet analyzed"}
- Content style: ${input.contentStyle ?? "not specified"}
- Ideas generated this session: ${input.ideasGeneratedCount}
- Competitors tracked: ${input.competitorsTracked}
${input.topViralPatterns?.length ? `- Top viral patterns: ${input.topViralPatterns.join(", ")}` : ""}
${input.contentPillars?.length ? `- Content pillars: ${input.contentPillars.join(", ")}` : ""}

Return ONLY valid JSON (no markdown fences):
{
  "overall_assessment": "2-3 sentence honest assessment of their growth position this week",
  "wins": [
    "3 things they should celebrate or recognize as positive momentum"
  ],
  "losses": [
    "2-3 honest areas where they're leaving growth on the table"
  ],
  "growth_opportunities": [
    "3-4 specific growth opportunities available to them right now"
  ],
  "recommended_actions": [
    {
      "action": "Specific, actionable task",
      "priority": "high|medium|low",
      "impact": "1 sentence on the expected impact"
    }
  ],
  "weekly_focus": "THE single most important thing they should do this week — be very specific",
  "content_plan": [
    { "day": "Monday", "format": "short-video", "topic": "Specific content idea" },
    { "day": "Wednesday", "format": "carousel", "topic": "Specific content idea" },
    { "day": "Friday", "format": "short-video", "topic": "Specific content idea" }
  ],
  "mindset_note": "1-2 sentences of honest, motivating (not fluffy) coaching advice"
}

Rules:
- Be specific and honest, not generic
- recommended_actions should have 4-5 items, at least 2 high priority
- content_plan should have 3-5 days based on their likely posting frequency
- wins/losses must feel personalized to their context, not copy-pasted`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  return JSON.parse(raw) as WeeklyReport;
}
