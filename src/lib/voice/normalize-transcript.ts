/** Light cleanup before saving voice text — keeps your words, trims noise. */
export function normalizeVoiceTranscript(raw: string): string {
  let text = raw.replace(/\s+/g, " ").trim();
  // Drop common meta-instructions to the recorder / AI.
  const metaPatterns = [
    /\bgo back\b.*\btranscript\b/i,
    /\bremove the back\s*space\b/i,
    /\blet'?s get started\b/i,
    /\bwe'?re getting tuned in\b/i,
    /\bclear\?\s/i,
  ];
  for (const pattern of metaPatterns) {
    text = text.replace(pattern, " ").trim();
  }
  return text.replace(/\s+/g, " ").trim();
}
