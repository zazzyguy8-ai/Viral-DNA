import { anthropic } from "./client";

export interface ViralDNAInput {
  platform: string;
  handle: string;
  profileUrl?: string;
  niche: string;
  contentDescription: string;
  bestPosts: string;
  postingFrequency: string;
}

export interface ViralDNAResult {
  overall_score: number;
  growth_score: number;
  consistency_score: number;
  branding_score: number;
  audience_clarity_score: number;
  audience_type: string;
  content_style: string;
  creator_positioning: string;
  analysis_summary: string;
  content_pillars: Array<{
    name: string;
    strength: "strong" | "medium" | "weak";
    description: string;
    examples: string[];
    score: number;
    rank: number;
  }>;
  viral_patterns: Array<{
    type: "topic" | "hook" | "format" | "cta" | "length" | "timing";
    pattern: string;
    performance: "high" | "medium" | "low";
    examples: string[];
    frequency: number;
  }>;
}

export async function analyzeViralDNA(input: ViralDNAInput): Promise<ViralDNAResult> {
  const prompt = `You are the Viral DNA Engine — an elite AI system that analyzes content creators and identifies the hidden patterns behind their growth.

STEP 1: Use web_search to find real information about this creator. Search for: "@${input.handle} ${input.platform} creator" — find their real follower count, subscriber count, recent video/post titles, view counts, and engagement data.
STEP 2: Use the real data from search results in your analysis. Reference specific video titles, actual numbers, and real patterns you found.
STEP 3: Return the Viral DNA profile as valid JSON.

CREATOR DATA:
- Platform: ${input.platform}
- Handle: @${input.handle}
${input.profileUrl ? `- Profile URL: ${input.profileUrl}` : ""}
- Niche: ${input.niche}
${input.contentDescription ? `- Additional context from creator: ${input.contentDescription}` : ""}
${input.bestPosts ? `- Top content noted by creator: ${input.bestPosts}` : ""}
${input.postingFrequency ? `- Posting frequency: ${input.postingFrequency}` : ""}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):

{
  "overall_score": <0-100 integer>,
  "growth_score": <0-100 integer>,
  "consistency_score": <0-100 integer>,
  "branding_score": <0-100 integer>,
  "audience_clarity_score": <0-100 integer>,
  "audience_type": "<specific audience description, 1 sentence>",
  "content_style": "<creator's unique content style, 1 sentence>",
  "creator_positioning": "<their unique positioning statement, under 10 words>",
  "analysis_summary": "<2-3 sentence summary of their Viral DNA, what's working, what's not, key opportunity — reference real numbers/titles found>",
  "content_pillars": [
    {
      "name": "<pillar name>",
      "strength": "<strong|medium|weak>",
      "description": "<what this pillar is and how well they execute it — cite real examples if found>",
      "examples": ["<specific real example from their content>", "<another specific example>"],
      "score": <0-100>,
      "rank": <1-5>
    }
  ],
  "viral_patterns": [
    {
      "type": "<topic|hook|format|cta|length|timing>",
      "pattern": "<specific repeating pattern you detected from real content>",
      "performance": "<high|medium|low>",
      "examples": ["<real specific example>"],
      "frequency": <estimated times per month as integer>
    }
  ]
}

Rules:
- Generate exactly 4-5 content pillars ranked by strength
- Generate exactly 6-8 viral patterns covering different types
- Scores must be honest and varied — not all high
- Use REAL data from your web search — cite actual video titles, real follower numbers, real view counts
- If the creator is less well-known and search results are limited, say so in analysis_summary but still give your best analysis
- The positioning statement should be punchy and memorable`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1600,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: "web_search_20260209", name: "web_search" } as any],
    messages: [{ role: "user", content: prompt }],
  });

  // Find the last text block — server-side web search may produce multiple content blocks
  let text = "";
  for (const block of message.content) {
    if (block.type === "text") text = block.text;
  }

  // Extract JSON from response — handles markdown fences and leading/trailing text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as ViralDNAResult;
}
