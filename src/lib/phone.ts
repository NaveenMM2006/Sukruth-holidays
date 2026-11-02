/** Returns a cleaned phone number, or null if it does not look like a valid mobile number. */
export function normalizePhone(input: unknown): string | null {
  const raw = String(input ?? "").trim().replace(/[\s\-()]/g, "");
  if (!/^\+?\d{10,13}$/.test(raw)) return null;
  return raw;
}
