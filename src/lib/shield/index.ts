import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AIProviderNotConfiguredError } from "@/lib/ai/errors";
import { SHIELD_PATTERNS } from "./patterns";
import { classifyForInjection } from "./classifier";
import { ShieldQuarantineError } from "./errors";

export { ShieldQuarantineError } from "./errors";

export type ShieldSource = "transcript" | "chat" | "document";

export interface ShieldResult {
  verdict: "passed" | "quarantined";
  matchedRule: string;
}

/**
 * Screens external text (call transcript, chat message, uploaded document)
 * before it reaches a reasoning prompt. Regex layer runs first — cheap and
 * catches known phrasings without an API call; the Haiku classifier layer
 * only runs if the regex layer passes. Every screen is logged to
 * `shield_log` for the settings/shield audit view.
 */
export async function screenText(params: {
  source: ShieldSource;
  text: string;
  leadId?: string;
}): Promise<ShieldResult> {
  const { source, text, leadId } = params;

  for (const { name, pattern } of SHIELD_PATTERNS) {
    if (pattern.test(text)) {
      await logShieldEvent({ source, text, leadId, matchedRule: name, verdict: "quarantined" });
      return { verdict: "quarantined", matchedRule: name };
    }
  }

  try {
    const { isInjection, reason } = await classifyForInjection(text);
    if (isInjection) {
      const matchedRule = `haiku_classifier: ${reason}`;
      await logShieldEvent({ source, text, leadId, matchedRule, verdict: "quarantined" });
      return { verdict: "quarantined", matchedRule };
    }
  } catch (err) {
    if (!(err instanceof AIProviderNotConfiguredError)) throw err;
    // No AI provider configured yet — the regex layer above still ran.
    // Fail open on the classifier layer rather than blocking every call
    // that touches external text during early development.
  }

  await logShieldEvent({ source, text, leadId, matchedRule: "none", verdict: "passed" });
  return { verdict: "passed", matchedRule: "none" };
}

/** Convenience wrapper for call sites that should simply throw on quarantine. */
export async function screenOrThrow(params: {
  source: ShieldSource;
  text: string;
  leadId?: string;
}): Promise<void> {
  const result = await screenText(params);
  if (result.verdict === "quarantined") {
    throw new ShieldQuarantineError(result.matchedRule);
  }
}

async function logShieldEvent(params: {
  source: ShieldSource;
  text: string;
  leadId?: string;
  matchedRule: string;
  verdict: "passed" | "quarantined";
}) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("shield_log").insert({
    source: params.source,
    lead_id: params.leadId ?? null,
    input_excerpt: params.text.slice(0, 500),
    matched_rule: params.matchedRule,
    verdict: params.verdict,
  });
  if (error) throw error;
}
