import { anthropic } from "./client";

export interface CompetitorInput {
  platform: string;
  handle: string;
  niche: string;
  description?: string;
}

export interface CompetitorAnalysis {
  display_name: string;
  estimated_followers: number;
  growth_velocity: "fast" | "medium" | "slow";
  content_style: string;
  posting_frequency: string;
  strengths: string[];
  weaknesses: string[];
  content_gaps: string[];
  opportunities: string[];
  top_formats: string[];
  viral_hooks: string[];
  threat_level: "high" | "medium" | "low";
  key_insight: string;
  steal_worthy: string[];
}

export async function analyzeCompetitor(input: CompetitorInput): Promise<CompetitorAnalysis> {
  const prompt = `You are a competitive intelligence analyst for content creators. Analyze this competitor creator and identify strategic insights.

Competitor:
- Platform: ${input.platform}
- Handle: @${input.handle}
- Niche: ${input.niche}
${input.description ? `- Additional context: ${input.description}` : ""}

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "display_name": "Estimated or inferred creator name",
  "estimated_followers": 50000,
  "growth_velocity": "fast|medium|slow",
  "content_style": "1 sentence description of their content style",
  "posting_frequency": "e.g. daily, 3x/week",
  "strengths": [
    "3-4 specific things they do really well"
  ],
  "weaknesses": [
    "2-3 genuine gaps or weaknesses you can exploit"
  ],
  "content_gaps": [
    "3-4 topics/angles they're missing that their audience would want"
  ],
  "opportunities": [
    "3-4 specific opportunities for you to capture their audience"
  ],
  "top_formats": ["short-video", "carousel"],
  "viral_hooks": [
    "Hook pattern they likely use",
    "Another typical hook pattern"
  ],
  "threat_level": "high|medium|low",
  "key_insight": "The single most important insight about this competitor in 1 sentence",
  "steal_worthy": [
    "Specific tactic or format to adapt (not copy)",
    "Another steal-worthy approach"
  ]
}

Be specific and realistic. Threat level: high = they dominate the niche, medium = strong but beatable, low = easy to outperform.`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  return JSON.parse(raw) as CompetitorAnalysis;
}
