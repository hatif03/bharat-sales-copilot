/**
 * Thrown by every KippsClient method until the real API reference (exact
 * endpoint paths, request/response shapes, webhook signature format) is
 * confirmed from the authenticated Kipps.AI dashboard's Developer section.
 * The public docs.kipps.ai pages describe the Api-Key auth header and base
 * URL but not the endpoints themselves.
 */
export class KippsAPINotConfirmedError extends Error {
  constructor(method: string) {
    super(
      `KippsClient.${method}() is not wired up yet — the real Kipps.AI endpoint spec hasn't been confirmed. Grab the API reference from the Kipps dashboard's Developer section and update src/lib/kipps/client.ts.`
    );
    this.name = "KippsAPINotConfirmedError";
  }
}
