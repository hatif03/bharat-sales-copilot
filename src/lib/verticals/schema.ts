import { z } from "zod";

export const LeadChannel = z.object({
  type: z.enum([
    "website",
    "whatsapp",
    "facebook_ads",
    "google_ads",
    "referral",
    "qr_code",
    "trade_fair",
  ]),
  notes: z.string().optional(),
});

export const Consideration = z.object({
  category: z.string(),
  text: z.string(),
});

export const GeneratedVertical = z.object({
  name: z.string(),
  icp: z.object({
    titles: z.array(z.string()),
    company_size: z.string(),
    languages: z.array(z.string()),
    states_or_cities: z.array(z.string()),
    industries: z.array(z.string()),
    exclusions: z.array(z.string()),
  }),
  lead_channels: z.array(LeadChannel),
  voice_persona: z.object({
    tone: z.string(),
    description: z.string(),
  }),
  considerations: z.array(Consideration),
});

export type GeneratedVertical = z.infer<typeof GeneratedVertical>;
