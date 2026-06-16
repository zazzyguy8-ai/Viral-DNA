import { anthropic } from "./client";

export interface ContentIdea {
  title: string;
  hook: string;
  format: "short-video" | "long-video" | "carousel" | "thread" | "story" | "live";
  angle: string;
  estimated_virality: number;
  why_it_works: string;
  cta: string;
}

export interface IdeaGeneratorInput {
  platform: string;
  niche: string;
  contentStyle?: string;
  audienceType?: string;
  viralPatterns?: string[];
  count?: number;
}

export interface IdeaGeneratorResult {
  ideas: ContentIdea[];
  generation_context: string;
}

export async function generateContentIdeas(
  input: IdeaGeneratorInput
): Promise<IdeaGeneratorResult> {
  const count = input.count ?? 10;
  const patternsText = input.viralPatterns?.length
    ? `\nKnown viral patterns for this creator: ${input.viralPatterns.join(", ")}`
    : "";

  const prompt = `You are a viral content strategist. Generate ${count} high-potential content ideas for a ${input.platform} creator.

Creator profile:
- Niche: ${input.niche}
- Content style: ${input.contentStyle ?? "not specified"}
- Audience type: ${input.audienceType ?? "not specified"}
${patternsText}

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "ideas": [
    {
      "title": "Exact video/post title",
      "hook": "First 3-5 seconds hook that stops the scroll",
      "format": "short-video|long-video|carousel|thread|story|live",
      "angle": "The unique angle or perspective",
      "estimated_virality": 85,
      "why_it_works": "1 sentence explanation of why this will perform",
      "cta": "Specific call to action for this piece"
    }
  ],
  "generation_context": "1 sentence about the strategy behind these ideas"
}

Rules:
- estimated_virality is 0-100 (be realistic, most are 40-75, only rare ideas exceed 85)
- Titles must be specific and clickable, not generic
- Hooks must be concrete action sentences
- Mix formats (don't make all short-video)
- Ideas must feel native to ${input.platform} specifically`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  return JSON.parse(raw) as IdeaGeneratorResult;
}
