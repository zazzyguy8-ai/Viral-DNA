import { anthropic } from "./client";
import type { YouTubeChannelData } from "@/lib/youtube";
import { formatYouTubeDataForPrompt } from "@/lib/youtube";

export interface CompetitorInput {
  platform: string;
  handle: string;
  niche: string;
  description?: string;
  youtubeData?: YouTubeChannelData;
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

const JSON_SCHEMA = `{
  "display_name": "Real creator name or handle",
  "estimated_followers": <real or estimated number>,
  "growth_velocity": "fast|medium|slow",
  "content_style": "1 sentence — specific to their actual content",
  "posting_frequency": "e.g. daily, 3x/week",
  "strengths": ["3-4 specific things with real examples"],
  "weaknesses": ["2-3 real gaps you can exploit"],
  "content_gaps": ["3-4 topics/angles they're missing"],
  "opportunities": ["3-4 specific ways to capture their audience"],
  "top_formats": ["short-video", "carousel"],
  "viral_hooks": ["Real hook from their content", "Another real hook pattern"],
  "threat_level": "high|medium|low",
  "key_insight": "The single most important insight — data-driven",
  "steal_worthy": ["Specific tactic to adapt (not copy)", "Another steal-worthy approach"]
}`;

export async function analyzeCompetitor(input: CompetitorInput): Promise<CompetitorAnalysis> {
  const competitorContext = `Competitor:
- Platform: ${input.platform}
- Handle: @${input.handle}
- Niche: ${input.niche}
${input.description ? `- Additional context: ${input.description}` : ""}`;

  let raw: string;

  // ── PATH A: YouTube with real API data ──────────────────────────────────
  if (input.youtubeData) {
    const prompt = `You are a competitive intelligence analyst for content creators.

${competitorContext}

${formatYouTubeDataForPrompt(input.youtubeData)}

Analyze this competitor using the real YouTube data above. Return ONLY valid JSON (no markdown fences):

${JSON_SCHEMA}

Threat level: high = they dominate the niche, medium = strong but beatable, low = easy to outperform.
Be specific — cite actual video titles and real numbers from the data above.`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1300,
      messages: [{ role: "user", content: prompt }],
    });

    raw = msg.content[0].type === "text" ? msg.content[0].text : "";

  // ── PATH B: Fast Haiku analysis (no web search — avoids Render timeout) ──
  } else {
    const prompt = `You are a competitive intelligence analyst for content creators.

${competitorContext}

Analyze this competitor based on your knowledge of the platform, niche, and creator landscape. Be as specific as possible given the handle and niche provided.

Return ONLY valid JSON (no markdown fences):

${JSON_SCHEMA}

Threat level: high = they dominate the niche, medium = strong but beatable, low = easy to outperform.
Be specific and strategic — give actionable insights, not generic advice.`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1300,
      messages: [{ role: "user", content: prompt }],
    });

    raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  }

  raw = raw
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in competitor response: ${raw.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as CompetitorAnalysis;
}
