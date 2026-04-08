/** Normaliza para apenas dígitos; exige 10–13 dígitos (DDD + número, opcional 55). */
export function normalizeWhatsappDigits(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length < 10 || d.length > 13) return null;
  return d;
}

export function formatWhatsappHint(value: string): string {
  return value.replace(/\D/g, "").slice(0, 13);
}
