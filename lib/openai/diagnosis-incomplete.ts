/** Thrown when OpenAI JSON is missing required diagnosis fields (no UI defaults). */
export class DiagnosisIncompleteError extends Error {
  readonly missing: string[]

  constructor(missing: string[]) {
    super(
      `AI diagnosis incomplete — missing or too short: ${missing.join(", ")}. Retry analysis.`
    )
    this.name = "DiagnosisIncompleteError"
    this.missing = missing
  }
}
