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

Analyze this creator and return a detailed Viral DNA profile as valid JSON.

CREATOR DATA:
- Platform: ${input.platform}
- Handle: @${input.handle}
${input.profileUrl ? `- Profile URL: ${input.profileUrl}` : ""}
- Niche: ${input.niche}
- Content Description: ${input.contentDescription || "Not provided"}
- Best Performing Content: ${input.bestPosts || "Not provided"}
- Posting Frequency: ${input.postingFrequency || "Unknown"}

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
  "analysis_summary": "<2-3 sentence summary of their Viral DNA, what's working, what's not, key opportunity>",
  "content_pillars": [
    {
      "name": "<pillar name>",
      "strength": "<strong|medium|weak>",
      "description": "<what this pillar is and how well they execute it>",
      "examples": ["<example from their content>", "<another example>"],
      "score": <0-100>,
      "rank": <1-5>
    }
  ],
  "viral_patterns": [
    {
      "type": "<topic|hook|format|cta|length|timing>",
      "pattern": "<specific repeating pattern you detected>",
      "performance": "<high|medium|low>",
      "examples": ["<example>"],
      "frequency": <estimated times per month as integer>
    }
  ]
}

Rules:
- Generate exactly 4-5 content pillars ranked by strength
- Generate exactly 6-8 viral patterns covering different types
- Scores must be honest and varied — not all high
- Be specific and personalized, not generic
- The positioning statement should be punchy and memorable`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response — handles markdown fences and leading/trailing text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as ViralDNAResult;
}
