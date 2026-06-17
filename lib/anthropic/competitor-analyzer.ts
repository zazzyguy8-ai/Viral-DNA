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
  const prompt = `You are a competitive intelligence analyst for content creators.

STEP 1: Use web_search to find real data about this competitor. Search for: "@${input.handle} ${input.platform} creator" — find their real follower count, recent viral content, posting patterns, and engagement stats.
STEP 2: Use the real data you find to build accurate competitive intelligence.
STEP 3: Return your analysis as valid JSON.

Competitor:
- Platform: ${input.platform}
- Handle: @${input.handle}
- Niche: ${input.niche}
${input.description ? `- Additional context: ${input.description}` : ""}

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "display_name": "Real creator name found from search, or handle if unknown",
  "estimated_followers": <real follower count from search, or best estimate>,
  "growth_velocity": "fast|medium|slow",
  "content_style": "1 sentence description based on real content found",
  "posting_frequency": "e.g. daily, 3x/week — based on real posting pattern",
  "strengths": [
    "3-4 specific things they do really well — cite real examples/videos"
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
    "Real hook pattern from their actual content",
    "Another hook pattern you found"
  ],
  "threat_level": "high|medium|low",
  "key_insight": "The single most important insight about this competitor — based on real data",
  "steal_worthy": [
    "Specific tactic or format to adapt (not copy) — from real content",
    "Another steal-worthy approach"
  ]
}

Be specific and use REAL data from your search. Threat level: high = they dominate the niche, medium = strong but beatable, low = easy to outperform.`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1300,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: "web_search_20260209", name: "web_search" } as any],
    messages: [{ role: "user", content: prompt }],
  });

  // Find the last text block — server-side web search may produce multiple content blocks
  let raw = "";
  for (const block of msg.content) {
    if (block.type === "text") raw = block.text;
  }

  raw = raw
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  // Extract JSON if there's surrounding text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in competitor response: ${raw.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as CompetitorAnalysis;
}
