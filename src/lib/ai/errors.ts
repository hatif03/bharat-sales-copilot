/**
 * Thrown by the stub AI client when ANTHROPIC_API_KEY isn't set. Callers
 * catch this and fall back to seeded/mock content for that feature instead
 * of blocking the build on a missing key.
 */
export class AIProviderNotConfiguredError extends Error {
  constructor() {
    super(
      "ANTHROPIC_API_KEY is not set — no real AI provider is configured. Catch AIProviderNotConfiguredError and fall back to seeded content for this feature."
    );
    this.name = "AIProviderNotConfiguredError";
  }
}
