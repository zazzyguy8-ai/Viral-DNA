export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Platform = "youtube" | "tiktok" | "instagram" | "x";
export type Plan = "free" | "pro" | "agency";
export type DnaStatus = "pending" | "processing" | "complete" | "failed";
export type PillarStrength = "strong" | "medium" | "weak";
export type PatternType = "topic" | "hook" | "format" | "cta" | "length" | "timing";
export type Performance = "high" | "medium" | "low";
export type IdeaType = "video" | "post" | "hook" | "cta" | "series";
export type SubStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      creator_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: Platform;
          handle: string;
          display_name: string | null;
          avatar_url: string | null;
          follower_count: number | null;
          is_primary: boolean;
          last_analyzed_at: string | null;
          raw_profile_data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creator_accounts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["creator_accounts"]["Insert"]>;
      };
      viral_dna_profiles: {
        Row: {
          id: string;
          user_id: string;
          creator_account_id: string | null;
          overall_score: number | null;
          growth_score: number | null;
          consistency_score: number | null;
          branding_score: number | null;
          audience_clarity_score: number | null;
          audience_type: string | null;
          content_style: string | null;
          creator_positioning: string | null;
          analysis_summary: string | null;
          raw_analysis: Json | null;
          status: DnaStatus;
          version: number;
          generated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["viral_dna_profiles"]["Row"], "id" | "generated_at">;
        Update: Partial<Database["public"]["Tables"]["viral_dna_profiles"]["Insert"]>;
      };
      content_pillars: {
        Row: {
          id: string;
          viral_dna_id: string;
          name: string;
          strength: PillarStrength | null;
          description: string | null;
          examples: string[] | null;
          score: number | null;
          rank: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["content_pillars"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["content_pillars"]["Insert"]>;
      };
      viral_patterns: {
        Row: {
          id: string;
          viral_dna_id: string;
          type: PatternType | null;
          pattern: string;
          performance: Performance | null;
          examples: string[] | null;
          frequency: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["viral_patterns"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["viral_patterns"]["Insert"]>;
      };
      competitors: {
        Row: {
          id: string;
          user_id: string;
          platform: Platform;
          handle: string;
          display_name: string | null;
          avatar_url: string | null;
          follower_count: number | null;
          added_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["competitors"]["Row"], "id" | "added_at">;
        Update: Partial<Database["public"]["Tables"]["competitors"]["Insert"]>;
      };
      competitor_analyses: {
        Row: {
          id: string;
          user_id: string;
          competitor_id: string;
          viral_dna_id: string | null;
          strengths: string[] | null;
          weaknesses: string[] | null;
          content_gaps: string[] | null;
          opportunities: string[] | null;
          comparison_data: Json | null;
          generated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["competitor_analyses"]["Row"], "id" | "generated_at">;
        Update: Partial<Database["public"]["Tables"]["competitor_analyses"]["Insert"]>;
      };
      content_ideas: {
        Row: {
          id: string;
          user_id: string;
          viral_dna_id: string | null;
          type: IdeaType | null;
          platform: Platform | null;
          title: string;
          description: string | null;
          hook: string | null;
          cta: string | null;
          estimated_score: number | null;
          is_saved: boolean;
          is_used: boolean;
          generated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["content_ideas"]["Row"], "id" | "generated_at">;
        Update: Partial<Database["public"]["Tables"]["content_ideas"]["Insert"]>;
      };
      weekly_reports: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          week_end: string;
          wins: string[] | null;
          losses: string[] | null;
          growth_opportunities: string[] | null;
          recommended_actions: string[] | null;
          dna_score_delta: number | null;
          report_data: Json | null;
          pdf_url: string | null;
          share_token: string;
          generated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["weekly_reports"]["Row"], "id" | "generated_at" | "share_token">;
        Update: Partial<Database["public"]["Tables"]["weekly_reports"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          plan: Exclude<Plan, "free"> | null;
          status: SubStatus | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
    };
  };
}
