export interface ShieldPattern {
  name: string;
  pattern: RegExp;
}

/**
 * First layer of the shield: cheap, fast regex checks for known
 * prompt-injection phrasings. Anything that matches is quarantined before
 * the (slower, costlier) Haiku classifier layer ever runs — mirrors the
 * original Deals Machine's "Lobster Trap" two-layer defense.
 */
export const SHIELD_PATTERNS: ShieldPattern[] = [
  { name: "ignore_instructions", pattern: /ignore\s+(all|any|the)?\s*(previous|prior|above|earlier)\s*(instructions?|prompts?|rules?)/i },
  { name: "disregard_instructions", pattern: /disregard\s+(all|any|the)?\s*(previous|prior|above|earlier)?\s*(instructions?|prompts?|rules?)/i },
  { name: "forget_instructions", pattern: /forget\s+(everything|all|what)\s+(you\s+(were|are)\s+told|above|before)/i },
  { name: "override_persona", pattern: /(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as)\s+(in\s+)?(developer|admin|jailbreak|unrestricted|dan)\s*mode/i },
  { name: "reveal_system_prompt", pattern: /(reveal|show|print|output|repeat)\s+(your|the)\s+(system\s+prompt|instructions|rules|configuration)/i },
  { name: "role_marker_injection", pattern: /^\s*(new\s+instructions|system\s*:|assistant\s*:|admin\s*:)/im },
  { name: "html_system_tag", pattern: /<\s*(system|instructions|admin)[\s>]/i },
  { name: "markdown_override_header", pattern: /#{2,}\s*(override|system|admin)\b/i },
  { name: "claims_no_restrictions", pattern: /(you\s+have\s+no|without\s+any)\s+(restrictions|limitations|filters|guidelines)/i },
  { name: "test_framing_as_bypass", pattern: /this\s+is\s+(just\s+)?a\s+test.{0,60}\b(ignore|disregard|bypass|skip)\b/i },
  { name: "explicit_prompt_injection_mention", pattern: /prompt\s*injection/i },
];
