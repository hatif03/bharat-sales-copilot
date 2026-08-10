import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ZodType } from "zod";
import { AIProviderNotConfiguredError } from "./errors";

// Sonnet for heavy reasoning (vertical generation, playbook composition, lead
// scoring/next-best-action, brain synthesis); Haiku for fast/cheap
// classification (language detection, live-call tagging, the shield
// classifier). Same split the original Deals Machine uses (Sonnet 4.6 +
// Haiku 4.5) — see DESIGN.md context and the plan's Architecture section.
const REASONING_MODEL = "claude-sonnet-5";
const FAST_MODEL = "claude-haiku-4-5";

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
      : new StubAIClient();
  }
  return cached;
}
