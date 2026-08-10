export class ShieldQuarantineError extends Error {
  constructor(public readonly matchedRule: string) {
    super(`Input quarantined by the shield (matched: ${matchedRule})`);
    this.name = "ShieldQuarantineError";
  }
}
