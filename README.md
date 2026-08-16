# Bharat Sales Copilot

An autonomous, multilingual AI sales agent for Indian SMBs — built for Kipps.AI's **New Age India 2026** hackathon.

Live app: **[bharat-sales-copilot.vercel.app](https://bharat-sales-copilot.vercel.app)**

## What this is

Tier-2/3 India is where demand for products like residential solar is exploding, but SMB sales teams can't keep up: leads arrive on WhatsApp, web forms, and phone calls, in Hindi, Hinglish, and English, and by the time a human replies the customer has already called someone else.

Bharat Sales Copilot provisions a **Kipps.AI Chat Agent and Voice Agent per business vertical** to qualify inbound leads in whichever language the customer uses, answer product questions grounded in a real Knowledge Base, invoke real business logic (an EMI calculator) mid-conversation, and escalate to a human the moment a lead shows strong buying intent — then runs the rest of the sales workflow (pipeline stage, follow-up scheduling, a synthesized "Brain" of what's working) in its own dashboard.

Kipps.AI is not a bolt-on chatbot widget here — it is the actual voice and chat runtime for every customer conversation in the product.

## Core features

- **Vertical Builder** — describe what you sell and who you sell to; an AI (or seeded fallback) generates an ICP, lead channels, voice persona, and playbook considerations, then provisions a real Kipps Chatbot + Voicebot for it via the Kipps API.
- **Dual-channel Kipps integration** — a web chat widget (Kipps Chat Agent, REST conversation API) and a phone-routed voice agent (Kipps Voice Agent), sharing one persona, one Knowledge Base, and the same API Functions.
- **Local language handling** — both agents detect and respond in Hindi, English, or Hinglish (code-switched), using Kipps' own STT/LLM/TTS stack — no separate language pipeline built on our side.
- **Knowledge Base grounding (RAG)** — domain FAQ documents (pricing/subsidy/EMI, installation/warranty/maintenance) attached directly to both Kipps agents so answers are grounded in real facts, not guessed.
- **API Functions (tool-calling)** — `escalate_to_specialist` creates a real Escalation record the moment a lead shows strong buying intent, wants to negotiate, or represents a bulk/enterprise account; `calculate_emi` is a deterministic EMI calculator the agent invokes for a real monthly number instead of a vague range.
- **Leads workspace** — contact card, live coaching panel, "what the brain knows about this lead," outcome tagging, follow-up actions.
- **Pipeline** — internal kanban (New → Qualifying → Nurturing → Meeting Booked → Escalated → Won/Lost), drag-and-drop.
- **Knowledge / Brain** — synthesized sales intelligence (landed/failed angles, objections, deal-killers, profiles to chase/avoid), separate from the Kipps Knowledge Base — this is our own inferred intelligence, not agent-facing reference docs.
- **Escalations** — human-handoff queue with full context bundle (conversation history, profile, buying signals) so a rep needs nothing repeated.
- **Intelligence console** — live Realtime feed of the automation loop as it runs.
- **Analytics** — call/chat outcomes, escalation rate, language distribution.
- **Shield** — a regex + Haiku/Groq classifier gate in front of every reasoning call that touches external text (transcript/chat/document), quarantining prompt-injection attempts before they reach a reasoning prompt.

## Architecture

```text
Kipps Chat Agent  ──┐
                     ├─► webhooks ──► Next.js API routes ──► Supabase (leads, calls, escalations, ...)
Kipps Voice Agent ──┘                        │
                                              ▼
                                   reasoning pass (shielded)
                                              │
                                              ▼
                          Pipeline update · Brain entries · follow-up schedule
```

- **Frontend**: Next.js (App Router) + Tailwind, a warm cream/espresso/gold design system (see `DESIGN.md`).
- **Backend**: Next.js Route Handlers — webhook receivers, orchestration endpoints, API Function receivers.
- **Database**: Supabase Postgres (hosted), with Realtime channels powering the live Intelligence console and Pipeline updates.
- **AI**: `src/lib/ai/client.ts` — Anthropic (Sonnet for reasoning, Haiku for fast classification) when `ANTHROPIC_API_KEY` is set, falling back automatically to **Groq** (OpenAI-compatible chat completions, zod-validated with a retry) when only `GROQ_API_KEY` is set, and to a stub responder (seeded content) when neither is configured — so the app never blocks on a missing key.
- **Kipps.AI**: `src/lib/kipps/client.ts` — Chatbot/Voicebot provisioning (`POST /kipps/chatbot/`, `POST /speech/voicebot/`) and the real chat runtime (`POST /v2/kipps/conversation/`, `POST /v2/kipps/reply/`). See "Kipps.AI platform notes" below — several of these endpoints are undocumented or behave differently from the published OpenAPI spec.
- **Shield**: `src/lib/shield/` — pattern deny-list + classifier gate in front of every reasoning call.
- **Deployment**: Vercel (app + API routes) + Supabase Cloud. No dedicated server/telephony bridge — Kipps owns the voice/chat runtime; telephony (if connected) is bring-your-own via Twilio/Plivo/Telnyx/Exotel.

### Project structure

```text
src/
  app/
    (app)/                  dashboard screens: verticals, leads, pipeline,
                             knowledge, escalations, intelligence, analytics, settings
    api/
      chat/session/         mints a Kipps conversation for the chat widget
      chat/message/         sends/receives a chat reply (POST /v2/kipps/reply/)
      functions/escalate/   receiver for the escalate_to_specialist API Function
      functions/calculate-emi/  receiver for the calculate_emi API Function
      webhooks/kipps-chat/  Kipps chat lead-capture webhook
      webhooks/kipps-voice/ Kipps voice call-event webhook
      webhooks/lead-inbound/  inbound lead intake (web form, etc.)
      leads/, verticals/    CRUD/orchestration endpoints
  components/                ChatWidget and shared dashboard UI
  lib/
    ai/                      Anthropic/Groq/stub provider interface
    kipps/                   Kipps.AI API client
    functions/               API Function schemas + handlers (escalate, calculate-emi)
    verticals/               vertical generation + Kipps provisioning
    leads/                   lead intake validation
    reasoning/                post-conversation analysis → Brain entries + Pipeline updates
    shield/                   prompt-injection pattern deny-list + classifier gate
    supabase/                 browser/server Supabase clients + generated types
content/
  knowledge-base/            Kipps Knowledge Base source documents (pricing/subsidy/EMI,
                              installation/warranty/maintenance)
supabase/
  migrations/                schema migrations (leads, calls, escalations, brain_entries,
                              automation_events, follow_up_schedule, ...)
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). (If port 3000 is taken, Next.js picks the next free port automatically.)

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Hosted Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only, never exposed to the client |
| `ANTHROPIC_API_KEY` | No | Primary reasoning provider (Sonnet + Haiku) |
| `GROQ_API_KEY` | No | Fallback reasoning provider, used automatically when `ANTHROPIC_API_KEY` is unset |
| `KIPPS_API_KEY` | Yes | Kipps.AI developer API key |
| `KIPPS_API_BASE_URL` | Yes | `https://backend.kipps.ai` |
| `KIPPS_ORGANIZATION_ID` | Yes | |
| `APP_BASE_URL` | Yes | Publicly reachable base URL for this app — Kipps POSTs webhooks here. Use a tunnel (ngrok) locally, the deployed Vercel URL in production. |
| `KIPPS_FUNCTION_SECRET` | Yes | Shared secret Kipps' API Function calls send back as `X-Function-Secret` |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | No | Not used by app code yet — see "Deferred" below |
| `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` / `GMAIL_REDIRECT_URI` | No | Secondary follow-up channel, not yet built |

### Database

Schema lives in `supabase/migrations/`. Against a linked hosted Supabase project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Generate TypeScript types after schema changes:

```bash
npm run supabase:types
```

### Design system

`DESIGN.md` (following the [google-labs-code/design.md](https://github.com/google-labs-code/design.md) spec) is the source of truth for the warm cream/espresso/gold visual system — colors, type scale, spacing, and component patterns. Lint it before major UI changes:

```bash
npm run design:lint
npm run design:export   # exports CSS custom properties to src/app/design-tokens.css
```

## Kipps.AI integration

### Provisioning

Each vertical provisions a real Kipps Chatbot and Voicebot via the API (`src/lib/verticals/provision.ts`), with generated persona/instructions and webhook URLs pointed at this app. There is no delete API for either resource — removing one requires the Kipps dashboard UI.

### Dashboard configuration (done per chatbot/voicebot, not via API)

- **Knowledge Base** — attach the documents in `content/knowledge-base/` to both agents.
- **API Functions** — add both, on both agents:
  - `escalate_to_specialist` → `POST {APP_BASE_URL}/api/functions/escalate`
  - `calculate_emi` → `POST {APP_BASE_URL}/api/functions/calculate-emi`
  - Both require the `X-Function-Secret` header matching `KIPPS_FUNCTION_SECRET`.

### Kipps.AI platform notes (confirmed by live testing, not assumption)

- The documented API surface is bot *configuration* only — there is no endpoint to place an outbound call or push a message to a specific contact. The Voice Agent is inbound-only (someone calls a Kipps-routed number, brought in via your own Twilio/Plivo/Telnyx/Exotel account).
- The real working chat path is `POST /v2/kipps/conversation/` + `POST /v2/kipps/reply/` (undocumented). The documented `POST /kipps/chatbot/{id}/session/` mints a LiveKit room that connects but no agent ever joins it.
- A Chatbot's real steering field is `instructions`, not `prompt` (the latter is present on the object but inert). The Voicebot API's `prompt` field, by contrast, *is* what the create/update call sets — but the dashboard's "Welcome Message"/"Agent Instructions" boxes don't reflect it, so those two fields currently need to be set by hand in the dashboard after provisioning.
- Auth is `Authorization: Api-Key <key>` (not `Api-Key: <key>` as shown in the public docs) plus `X-Organization-ID`.
- The Free plan enforces tight per-resource quotas — observed 1 Chatbot, 1 Voicebot, and likely 1 Knowledge Base per account. Don't create throwaway Chatbot/Voicebot/Knowledge Base test resources.
- Dashboard login failures are commonly reCAPTCHA rejecting automated/repeated attempts, surfaced as a generic "Invalid credentials" error — not an actual credentials problem.

See `ROADMAP.md` for the full, continuously-updated list of confirmed constraints and deferred features.

## Deployment

Deployed on Vercel, tracking `origin/master`. Set the environment variables above in the Vercel project settings, then set `APP_BASE_URL` to the assigned `*.vercel.app` domain (or custom domain) and redeploy — this value feeds every webhook URL Kipps calls back into.

## Deferred / not yet built

Tracked in detail in `ROADMAP.md`. Notable items:

- **Twilio/BYOT phone number** — not connected. Twilio trial accounts can't purchase a number without upgrading, and an India-region number additionally needs a compliance/KYC bundle. The Kipps dashboard's own Voice Agent "Test Agent" call already exercises the real Voice Agent end-to-end and satisfies the dual-channel requirement without a live phone number.
- **Gmail OAuth follow-up** (secondary channel).
- **Apollo-style outbound contact enrichment/prospecting** — deliberately out of scope (legal exposure around personal-data scraping; the product is inbound-first by design).
- **HubSpot CRM push** — the internal Pipeline kanban covers this for now.
- **Full Analytics trend charts** — current Analytics page is counts only.

## Tech stack

Next.js (App Router) · Tailwind CSS · Supabase (Postgres + Realtime) · Kipps.AI (Chat Agent + Voice Agent) · Anthropic Claude / Groq (reasoning) · Zod · Vercel
