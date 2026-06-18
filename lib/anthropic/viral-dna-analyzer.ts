import { anthropic } from "./client";
import type { YouTubeChannelData } from "@/lib/youtube";
import { formatYouTubeDataForPrompt } from "@/lib/youtube";

export interface AnalyticsImage {
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

export interface ViralDNAInput {
  platform: string;
  handle: string;
  profileUrl?: string;
  niche: string;
  contentDescription: string;
  bestPosts: string;
  postingFrequency: string;
  youtubeData?: YouTubeChannelData;
  analyticsImage?: AnalyticsImage;
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

const JSON_SCHEMA = `{
  "overall_score": <0-100 integer>,
  "growth_score": <0-100 integer>,
  "consistency_score": <0-100 integer>,
  "branding_score": <0-100 integer>,
  "audience_clarity_score": <0-100 integer>,
  "audience_type": "<specific audience description, 1 sentence>",
  "content_style": "<creator's unique content style, 1 sentence>",
  "creator_positioning": "<their unique positioning statement, under 10 words>",
  "analysis_summary": "<2-3 sentence summary — reference real numbers and specific content titles found>",
  "content_pillars": [
    {
      "name": "<pillar name>",
      "strength": "<strong|medium|weak>",
      "description": "<what this pillar is and how well they execute it — cite real examples>",
      "examples": ["<specific real example from their content>", "<another specific example>"],
      "score": <0-100>,
      "rank": <1-5>
    }
  ],
  "viral_patterns": [
    {
      "type": "<topic|hook|format|cta|length|timing>",
      "pattern": "<specific repeating pattern — based on real content>",
      "performance": "<high|medium|low>",
      "examples": ["<real specific example>"],
      "frequency": <estimated times per month as integer>
    }
  ]
}`;

const RULES = `Rules:
- Generate exactly 4-5 content pillars ranked by strength
- Generate exactly 6-8 viral patterns covering different types
- Scores must be honest and varied — not all high
- Be SPECIFIC — cite actual video/post titles, real numbers, real patterns
- The positioning statement should be punchy and memorable`;

export async function analyzeViralDNA(input: ViralDNAInput): Promise<ViralDNAResult> {
  const creatorContext = `CREATOR:
- Platform: ${input.platform}
- Handle: @${input.handle}
${input.profileUrl ? `- Profile URL: ${input.profileUrl}` : ""}
- Niche: ${input.niche}
${input.contentDescription ? `- Context from creator: ${input.contentDescription}` : ""}
${input.bestPosts ? `- Top content noted by creator: ${input.bestPosts}` : ""}
${input.postingFrequency ? `- Posting frequency: ${input.postingFrequency}` : ""}`;

  let text: string;

  // ── PATH A: YouTube with real API data ──────────────────────────────────
  if (input.youtubeData) {
    const prompt = `You are the Viral DNA Engine — an elite AI system that analyzes content creators and identifies the hidden patterns behind their growth.

${creatorContext}

${formatYouTubeDataForPrompt(input.youtubeData)}

Analyze this creator's Viral DNA using the real YouTube data above. Return ONLY valid JSON (no markdown):

${JSON_SCHEMA}

${RULES}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    text = message.content[0].type === "text" ? message.content[0].text : "";

  // ── PATH B: IG/TikTok/X with analytics screenshot ──────────────────────
  } else if (input.analyticsImage) {
    const prompt = `You are the Viral DNA Engine — an elite AI system that analyzes content creators.

${creatorContext}

The user has uploaded a screenshot of their analytics dashboard. Read the exact numbers from the screenshot (follower count, views, likes, reach, engagement rate, top posts, etc.) and use those real numbers in your analysis.

Analyze this creator's Viral DNA based on the screenshot data. Return ONLY valid JSON (no markdown):

${JSON_SCHEMA}

${RULES}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1800,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: input.analyticsImage.mediaType,
              data: input.analyticsImage.data,
            },
          },
          { type: "text", text: prompt },
        ],
      }],
    });

    text = message.content[0].type === "text" ? message.content[0].text : "";

  // ── PATH C: Web search for unknown/smaller creators ─────────────────────
  } else {
    const prompt = `You are the Viral DNA Engine — an elite AI system that analyzes content creators.

STEP 1: Use web_search to find real information about this creator. Search for "@${input.handle} ${input.platform} creator" to find their follower count, recent content titles, and engagement data.
STEP 2: Use the real data you find in your analysis. Reference specific titles and real numbers.
STEP 3: Return the Viral DNA profile as valid JSON.

${creatorContext}

Return ONLY valid JSON (no markdown):

${JSON_SCHEMA}

${RULES}
- If the creator is small/unknown and search returns limited data, say so in analysis_summary but still give your best analysis`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1600,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20260209", name: "web_search" } as any],
      messages: [{ role: "user", content: prompt }],
    });

    // Find the last text block — server-side web search produces multiple content blocks
    for (const block of message.content) {
      if (block.type === "text") text = block.text;
    }
    text ??= "";
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as ViralDNAResult;
}
