export type GradeBand = "K-1" | "2-3" | "4-5";

export type AslType = "iconic" | "neutral" | "fingerspell";

export interface HighInterestWord {
  word: string;
  emoji?: string;
  category:
    | "animals"
    | "foods"
    | "places"
    | "activities"
    | "feelings"
    | "tech"
    | "fantasy"
    | "nature"
    | "actions"
    | "nowWords";
  tags: string[]; // e.g. ["cute", "silly", "visual"]
  gradeBandEstimate: GradeBand;
  aslType: AslType;
  engagementType: "funny" | "cute" | "dramatic" | "action" | "cozy" | "cool" | "magical" | "exciting" | "creative";
  sentencePatterns: string[]; // patterns with ___ placeholder
}
