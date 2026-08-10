---
version: alpha
name: Bharat Sales Copilot
description: Warm cream/espresso/gold system carried over from the Deals Machine UI audit, adapted for an Indian multilingual sales workspace.
colors:
  primary: "#2B2118"
  secondary: "#8A8272"
  tertiary: "#C99A3E"
  neutral: "#F7F3EA"
  surface: "#FFFFFF"
  on-surface: "#2B2118"
  success: "#2E6B3E"
  danger: "#B33A3A"
  info: "#3E6FB0"
  highlight: "#6E5AC4"
  border: "#E4DCC8"
typography:
  headline-lg:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  headline-sm:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.08em
  quote-italic:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  sidebar: 240px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#3D2F22"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: 12px
  badge-status:
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
    padding: 4px
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
  badge-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
  badge-agent:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
  badge-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  insight-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  nav-item-active:
    backgroundColor: "#EFE8D8"
    textColor: "{colors.primary}"
  input-field:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 10px
---

# Bharat Sales Copilot — Design System

## Overview

Bharat Sales Copilot is a workspace for a single operator running an autonomous multilingual sales agent, not a generic SaaS admin panel. The tone carried over from the Deals Machine audit is **quietly confident, working-desk warmth**: cream paper rather than clinical white, an espresso-brown primary rather than corporate blue, and gold used sparingly for the moments the agent wants attention (a flagged consideration, a weighted brain entry, a live coaching cue). The product should feel like a well-organized notebook that happens to think for itself — dense with real data, never sterile, never playful. Every screen assumes the operator is mid-workday: information density and scan-ability matter more than decoration.

## Colors

- **Primary (`#2B2118`):** Espresso brown, not pure black. Reserved for primary CTAs ("Build a vertical", "Run the agent", "Save vertical"), active nav state, and headline text. Never more than one primary-filled action per screen.
- **Secondary (`#8A8272`):** Warm slate-tan for secondary text, metadata, timestamps, and icon strokes.
- **Tertiary (`#C99A3E`):** Gold. The agent's own voice — used for "considerations" badges, brain-entry weight bars, and anything the AI is drawing the operator's eye to. Never used for a user-initiated action.
- **Neutral (`#F7F3EA`):** The page background. Warm ivory, not white — this is what separates the product from a generic dashboard template.
- **Surface (`#FFFFFF`):** Card and panel backgrounds sit on pure white, floating slightly above the ivory page.
- **Border (`#E4DCC8`):** 1px hairlines between cards and list rows.
- **Success (`#3F7D4E`) / Danger (`#C24B4B`) / Info (`#3E6FB0`) / Highlight (`#6E5AC4`):** The status taxonomy carried directly from the brain's categories — green for landed angles/interested/complete, red for failed angles/deal-killers/not-interested, blue for commitments/callbacks/neutral status, indigo/purple reserved specifically for opener-variant cards so that one category in the playbook reads as visually distinct from the rest.

## Typography

Headings use **Sora** — geometric, slightly condensed, bold — to match the audit's "bold geometric sans" heading style. Body copy and every small uppercase label use **Inter**, a neutral grotesque that stays legible at the small sizes the app leans on heavily (metadata, weight tags, filter pills). There is no third display face; do not introduce one.

- **Headline-lg/md/sm (Sora):** Page titles, modal titles, vertical names. Tight line-height, no letter-spacing tricks beyond `headline-lg`'s slight negative tracking.
- **Body-md/sm (Inter):** Paragraph copy, card descriptions, form inputs.
- **Label-caps (Inter, 11px, uppercase, 0.08em tracking):** Every section header, field label, and status pill in the app ("TITLES", "COMPANY SIZE", "SOURCE"). This is the single most load-bearing typographic pattern in the original app — used far more than in a typical dashboard — and should stay consistent everywhere rather than being restyled per-screen.
- **Quote-italic (Inter, italic via CSS, not a separate weight):** Verbatim transcript quotes inside brain/insight cards, always paired with `label-caps` metadata underneath.

## Layout

A fixed 240px cream sidebar (nav grouped under `OPERATE` / `WORK` / `MEASURE` label-caps headers) plus a fluid main canvas, max-width unconstrained (the product is used on a desktop work display, not optimized for narrow viewports first). An 8px spacing scale (`xs` 4px through `xl` 32px) governs all internal padding; cards default to 16–24px internal padding ("generous" per the audit, never cramped). Multi-panel screens (Leads workspace, Vertical detail) use a two-column split — a narrower list/summary column and a wider detail column — never three equal columns.

## Elevation & Depth

Flat by default. Hierarchy comes from the ivory-page / white-card contrast and 1px hairline borders, not shadows — cards sit *on* the page via color contrast, not via drop shadow. The one exception is modals (Vertical Builder, refine dialogs), which get a soft shadow plus a dimmed/blurred backdrop to signal they're a temporary overlay, not a permanent panel.

## Shapes

Cards and panels use the `md` (10px) or `lg` (16px) radius — soft enough to feel approachable, sharp enough to stay dense and businesslike. Buttons, status pills, filter chips, and avatar badges are always fully rounded (`full`). Category/insight cards additionally carry a 4px colored left-border accent (success/danger/info/highlight/tertiary) as their primary means of visual categorization — this pattern should be reused for any new categorized-list UI rather than inventing a new one (e.g. a new icon system).

## Components

- **Buttons:** `button-primary` (espresso fill, cream text, fully rounded) for the single primary action per screen; `button-outline` (transparent, espresso border+text) for secondary actions; a ghost/text-only variant for tertiary/destructive actions ("Cancel", "Don't send").
- **Badges/pills:** `badge-status`, fully rounded, `label-caps` typography, background color keyed to the semantic status palette (green=positive, red=negative, blue=neutral/scheduled, gold=agent-flagged, black=terminal/pushed state).
- **Stat cards:** small icon + `label-caps` label + large `headline-md` number, used in the dashboard stat strip and vertical stat rows.
- **Insight/brain cards:** 4px colored left border, `label-caps` category header + count badge, body-sm insight text, italic quote, `label-caps` metadata footer (source + weight + relative time).
- **Nav items:** `label-caps`-adjacent sizing but not uppercase; active state gets `nav-item-active` background + left black bar, inactive state is plain text on the sidebar's cream.
- **Inputs:** white background, 1px border, `sm` radius, `body-md` value text, placeholder in `secondary` color.

## Do's and Don'ts

- Do reserve the espresso `primary` fill for exactly one action per screen — if two things compete for attention, one becomes `button-outline`.
- Do use `label-caps` for every field/section label; don't invent a second label style for "just this one screen."
- Do use the 4px colored left-border pattern for any new categorized card list; don't introduce a new categorization pattern (icons-only, background-tint-only) for the same job.
- Do keep gold (`tertiary`) exclusive to agent-flagged content (considerations, weights, "agent draft ready" callouts); don't use it for user-triggered success states — that's `success` green.
- Don't use pure white (`#FFFFFF`) as a page background — only cards/panels sit on white; the page itself is always `neutral` ivory.
- Don't mix the `full`-rounded pill shape with the `md`/`lg` card radius on the same element — pills are either fully rounded or square-cornered, never in between.
- Do maintain WCAG AA contrast (4.5:1) for all `label-caps` text against its background — several status colors (gold, light blue) need a darker text-on-fill variant rather than white text at small sizes.
- Don't use Tailwind's bare `max-w-{xs,sm,md,lg,xl}` / `w-{...}` / `h-{...}` utilities expecting Tailwind's original prose-width defaults — the `spacing` tokens above (`xs`–`xl`) are exported into the same `--spacing-*` namespace Tailwind v4 uses for *all* spacing-consuming utilities (padding, margin, gap, width, height, max-width, inset, translate), so `max-w-md` resolves to our 16px spacing token, not Tailwind's ~28rem. That's intentional for `p-md`/`gap-md`/`w-md`; for a one-off prose/container width, use an arbitrary value (`max-w-[28rem]`) instead of reaching for a named key.
