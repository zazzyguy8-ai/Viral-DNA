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

  // ── PATH C: Web search with 24s timeout → fallback to Haiku ────────────
  } else {
    const searchPrompt = `You are the Viral DNA Engine — an elite AI system that analyzes content creators.

Do ONE web_search for "@${input.handle} ${input.platform}" to find their real follower count and recent content. Then analyze and return JSON.

${creatorContext}

Return ONLY valid JSON (no markdown):

${JSON_SCHEMA}

${RULES}
- If the creator is small/unknown and search returns limited data, say so in analysis_summary but still give your best analysis`;

    const fallbackPrompt = `You are the Viral DNA Engine — an elite AI system that analyzes content creators.

${creatorContext}

Analyze this creator based on their handle, platform, and niche. Be as specific as possible. Return ONLY valid JSON (no markdown):

${JSON_SCHEMA}

${RULES}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 24000);

      const message = await anthropic.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 1400,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: [{ type: "web_search_20260209", name: "web_search" } as any],
          messages: [{ role: "user", content: searchPrompt }],
        },
        { signal: controller.signal }
      );
      clearTimeout(timer);

      for (const block of message.content) {
        if (block.type === "text") text = block.text;
      }
      text ??= "";
    } catch {
      // Timed out or web search failed — fall back to fast Haiku
      const fallback = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1800,
        messages: [{ role: "user", content: fallbackPrompt }],
      });
      text = fallback.content[0].type === "text" ? fallback.content[0].text : "";
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as ViralDNAResult;
}
