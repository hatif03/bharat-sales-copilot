import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z, type ZodType } from "zod";
import { AIProviderNotConfiguredError } from "./errors";

// Sonnet for heavy reasoning (vertical generation, playbook composition, lead
// scoring/next-best-action, brain synthesis); Haiku for fast/cheap
// classification (language detection, live-call tagging, the shield
// classifier). Same split the original Deals Machine uses (Sonnet 4.6 +
// Haiku 4.5) — see DESIGN.md context and the plan's Architecture section.
const REASONING_MODEL = "claude-sonnet-5";
const FAST_MODEL = "claude-haiku-4-5";

// Groq fallback (no Anthropic key yet) — same effort split, mapped to
// whatever's currently the strongest/fastest model Groq hosts. Overridable
// via env in case Groq deprecates one of these.
const GROQ_REASONING_MODEL = process.env.GROQ_REASONING_MODEL || "llama-3.3-70b-versatile";
const GROQ_FAST_MODEL = process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface AIRequest<T> {
  system: string;
  prompt: string;
  schema: ZodType<T>;
  maxTokens?: number;
}

export interface AIClient {
  /** Sonnet-tier: heavy reasoning and composition. */
  reason<T>(request: AIRequest<T> & { effort?: Effort }): Promise<T>;
  /** Haiku-tier: fast, cheap classification. */
  classify<T>(request: AIRequest<T>): Promise<T>;
}

class AnthropicAIClient implements AIClient {
  private readonly client = new Anthropic();

  async reason<T>({
    system,
    prompt,
    schema,
    maxTokens = 4096,
    effort = "high",
  }: AIRequest<T> & { effort?: Effort }): Promise<T> {
    const response = await this.client.messages.parse({
      model: REASONING_MODEL,
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      output_config: { effort, format: zodOutputFormat(schema) },
      system,
      messages: [{ role: "user", content: prompt }],
    });
    return parsedOrThrow(response);
  }

  async classify<T>({
    system,
    prompt,
    schema,
    maxTokens = 1024,
  }: AIRequest<T>): Promise<T> {
    const response = await this.client.messages.parse({
      model: FAST_MODEL,
      max_tokens: maxTokens,
      output_config: { format: zodOutputFormat(schema) },
      system,
      messages: [{ role: "user", content: prompt }],
    });
    return parsedOrThrow(response);
  }
}

function parsedOrThrow<T>(response: { parsed_output: T | null }): T {
  if (response.parsed_output === null) {
    throw new Error("AI response failed schema validation");
  }
  return response.parsed_output;
}

/**
 * Groq's chat-completions API is OpenAI-compatible but doesn't offer
 * Anthropic-style guaranteed structured output — it only has best-effort
 * "json_object" mode. So the schema is embedded in the prompt and the
 * response is validated with zod, with one retry (feeding back the
 * validation error) before giving up.
 */
class GroqAIClient implements AIClient {
  private readonly apiKey = process.env.GROQ_API_KEY!;

  async reason<T>({ system, prompt, schema, maxTokens = 4096 }: AIRequest<T> & { effort?: Effort }): Promise<T> {
    return this.chatJSON({ system, prompt, schema, maxTokens, model: GROQ_REASONING_MODEL });
  }

  async classify<T>({ system, prompt, schema, maxTokens = 1024 }: AIRequest<T>): Promise<T> {
    return this.chatJSON({ system, prompt, schema, maxTokens, model: GROQ_FAST_MODEL });
  }

  private async chatJSON<T>({
    system,
    prompt,
    schema,
    maxTokens,
    model,
  }: AIRequest<T> & { model: string }): Promise<T> {
    const jsonSchema = z.toJSONSchema(schema);
    const schemaInstruction = `Respond with ONLY a single JSON object (no markdown fences, no prose) matching this JSON Schema:\n${JSON.stringify(jsonSchema)}`;

    const messages = [
      { role: "system" as const, content: `${system}\n\n${schemaInstruction}` },
      { role: "user" as const, content: prompt },
    ];

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (lastError) {
        messages.push({
          role: "user" as const,
          content: `Your previous response failed validation: ${lastError}. Reply again with a corrected JSON object only.`,
        });
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: "json_object" },
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Groq API error ${res.status}: ${body.slice(0, 500)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      let candidate: unknown;
      try {
        candidate = JSON.parse(content);
      } catch {
        lastError = "response was not valid JSON";
        continue;
      }

      const parsed = schema.safeParse(candidate);
      if (parsed.success) return parsed.data;
      lastError = parsed.error.message;
    }

    throw new Error(`Groq response failed schema validation after retry: ${lastError}`);
  }
}

class StubAIClient implements AIClient {
  async reason<T>(): Promise<T> {
    throw new AIProviderNotConfiguredError();
  }
  async classify<T>(): Promise<T> {
    throw new AIProviderNotConfiguredError();
  }
}

let cached: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!cached) {
    cached = process.env.ANTHROPIC_API_KEY
      ? new AnthropicAIClient()
      : process.env.GROQ_API_KEY
        ? new GroqAIClient()
        : new StubAIClient();
  }
  return cached;
}
