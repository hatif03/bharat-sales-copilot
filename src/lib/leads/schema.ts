import { z } from "zod";

export const InboundLead = z.object({
  vertical_id: z.string().uuid().optional(),
  name: z.string().optional(),
  phone: z.string(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  preferred_language: z.string().optional(),
  budget: z.string().optional(),
  requirements: z.string().optional(),
  industry: z.string().optional(),
  channel: z.enum([
    "website",
    "whatsapp",
    "facebook_ads",
    "google_ads",
    "referral",
    "qr_code",
    "trade_fair",
  ]),
});

export type InboundLead = z.infer<typeof InboundLead>;
