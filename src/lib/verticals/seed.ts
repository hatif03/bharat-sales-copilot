import type { GeneratedVertical } from "./schema";

/**
 * Fallback vertical used when ANTHROPIC_API_KEY isn't set yet (see
 * AIProviderNotConfiguredError) — lets the rest of the app be built and
 * demoed before a real key is available. Modeled on the Idea PDF's own
 * example (residential solar, EMI-driven, Hindi/English).
 */
export const SEED_VERTICAL: GeneratedVertical = {
  name: "Residential Solar — Tier-2/3 India",
  icp: {
    titles: ["Homeowner", "Small Business Owner"],
    company_size: "N/A (residential/small business)",
    languages: ["Hindi", "English", "Hinglish"],
    states_or_cities: ["Jaipur", "Lucknow", "Indore", "Nagpur", "Surat"],
    industries: ["Residential", "Small Retail"],
    exclusions: ["Renters (no roof ownership)", "Apartments without terrace access"],
  },
  lead_channels: [
    { type: "whatsapp", notes: "Primary inbound channel for EMI/pricing questions" },
    { type: "website", notes: "Solar EMI calculator landing page" },
    { type: "referral", notes: "Word-of-mouth from installed customers" },
    { type: "trade_fair", notes: "Local district trade fairs and exhibitions" },
  ],
  voice_persona: {
    tone: "Warm, patient, plain-spoken — no jargon",
    description:
      "A local solar advisor who explains EMI and subsidy math simply, in whichever language the homeowner is most comfortable in, and never pressures a decision on the first call.",
  },
  considerations: [
    {
      category: "language_coverage",
      text: "Regional language coverage is limited to Hindi/English/Hinglish — Tier-2/3 cities in this list also see meaningful Marathi and Gujarati speakers who may be under-served.",
    },
    {
      category: "seasonal_skew",
      text: "Solar interest spikes post-monsoon (Oct–Feb) when roofs dry out — a signal source that only samples current-month interest will under-represent the addressable market outside that window.",
    },
    {
      category: "subsidy_volatility",
      text: "State subsidy schemes change frequently — any EMI/payback-period claim in the playbook needs a recency check before every call, not a one-time fact bake-in.",
    },
  ],
};
