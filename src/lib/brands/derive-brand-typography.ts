import type { BrandProfile } from "@/types/brand";

export type BrandTypographyPresetId =
  | "premium_editorial"
  | "modern_saas"
  | "creative_modern"
  | "bold_startup"
  | "elegant_minimal"
  | "friendly"
  | "luxury_fashion"
  | "tech_ai"
  | "editorial_modern"
  | "strong_brand";

export type BrandTypographyPreset = {
  id: BrandTypographyPresetId;
  label: string;
  headingVar: string;
  bodyVar: string;
};

const PRESETS: Record<BrandTypographyPresetId, BrandTypographyPreset> = {
  premium_editorial: {
    id: "premium_editorial",
    label: "Premium editorial",
    headingVar: "var(--font-playfair)",
    bodyVar: "var(--font-brand-inter)",
  },
  modern_saas: {
    id: "modern_saas",
    label: "Modern SaaS",
    headingVar: "var(--font-plus-jakarta)",
    bodyVar: "var(--font-brand-inter)",
  },
  creative_modern: {
    id: "creative_modern",
    label: "Creative modern",
    headingVar: "var(--font-manrope)",
    bodyVar: "var(--font-brand-inter)",
  },
  bold_startup: {
    id: "bold_startup",
    label: "Bold startup",
    headingVar: "var(--font-space-grotesk)",
    bodyVar: "var(--font-brand-inter)",
  },
  elegant_minimal: {
    id: "elegant_minimal",
    label: "Elegant minimal",
    headingVar: "var(--font-dm-sans)",
    bodyVar: "var(--font-dm-sans)",
  },
  friendly: {
    id: "friendly",
    label: "Friendly",
    headingVar: "var(--font-nunito-sans)",
    bodyVar: "var(--font-nunito-sans)",
  },
  luxury_fashion: {
    id: "luxury_fashion",
    label: "Luxury fashion",
    headingVar: "var(--font-cormorant)",
    bodyVar: "var(--font-dm-sans)",
  },
  tech_ai: {
    id: "tech_ai",
    label: "Tech / AI",
    headingVar: "var(--font-sora)",
    bodyVar: "var(--font-brand-inter)",
  },
  editorial_modern: {
    id: "editorial_modern",
    label: "Editorial modern",
    headingVar: "var(--font-display)",
    bodyVar: "var(--font-sans)",
  },
  strong_brand: {
    id: "strong_brand",
    label: "Strong brand",
    headingVar: "var(--font-outfit)",
    bodyVar: "var(--font-brand-inter)",
  },
};

type ScoreMap = Partial<Record<BrandTypographyPresetId, number>>;

const KEYWORD_RULES: { preset: BrandTypographyPresetId; tokens: string[] }[] = [
  {
    preset: "luxury_fashion",
    tokens: [
      "luxury",
      "fashion",
      "haute",
      "boutique",
      "jewelry",
      "artisan",
      "bespoke",
    ],
  },
  {
    preset: "premium_editorial",
    tokens: [
      "premium",
      "sophisticated",
      "editorial",
      "magazine",
      "fine dining",
      "concierge",
    ],
  },
  {
    preset: "tech_ai",
    tokens: [
      "ai",
      "artificial",
      "software",
      "saas",
      "platform",
      "automation",
      "machine",
      "data",
      "cloud",
    ],
  },
  {
    preset: "bold_startup",
    tokens: [
      "startup",
      "disrupt",
      "venture",
      "scale",
      "growth",
      "fintech",
      "crypto",
    ],
  },
  {
    preset: "friendly",
    tokens: [
      "community",
      "wellness",
      "family",
      "friendly",
      "warm",
      "cozy",
      "yoga",
      "nonprofit",
      "local",
    ],
  },
  {
    preset: "creative_modern",
    tokens: [
      "creative",
      "studio",
      "design",
      "agency",
      "content",
      "media",
      "brand",
    ],
  },
  {
    preset: "modern_saas",
    tokens: [
      "b2b",
      "enterprise",
      "professional",
      "consulting",
      "services",
      "productivity",
    ],
  },
  {
    preset: "strong_brand",
    tokens: ["bold", "youth", "energy", "sport", "fitness", "street"],
  },
  {
    preset: "elegant_minimal",
    tokens: ["minimal", "clean", "simple", "modern", "refined"],
  },
];

function corpus(profile: BrandProfile): string {
  return [
    profile.business_name,
    profile.industry,
    profile.brand_voice,
    profile.target_audience,
    profile.additional_instructions,
    profile.desired_outcome,
  ]
    .join(" ")
    .toLowerCase();
}

function scorePreset(text: string, preset: BrandTypographyPresetId): number {
  const rule = KEYWORD_RULES.find((item) => item.preset === preset);
  if (!rule) {
    return 0;
  }
  let score = 0;
  for (const token of rule.tokens) {
    if (text.includes(token)) {
      score += token.includes(" ") ? 3 : 2;
    }
  }
  return score;
}

export function deriveBrandTypography(
  profile: BrandProfile,
): BrandTypographyPreset {
  const text = corpus(profile);
  const scores: ScoreMap = {};

  for (const rule of KEYWORD_RULES) {
    scores[rule.preset] = scorePreset(text, rule.preset);
  }

  let best: BrandTypographyPresetId = "editorial_modern";
  let bestScore = 0;

  for (const [id, score] of Object.entries(scores) as [
    BrandTypographyPresetId,
    number,
  ][]) {
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  if (bestScore === 0) {
    return PRESETS.editorial_modern;
  }

  return PRESETS[best];
}

export function getBrandTypographyPreset(
  id: BrandTypographyPresetId,
): BrandTypographyPreset {
  return PRESETS[id];
}
