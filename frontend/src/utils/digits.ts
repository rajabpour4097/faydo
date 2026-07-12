/** Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII 0-9 */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
}

/** Keep only ASCII digits after normalizing Persian/Arabic numerals */
export function normalizeDigits(value: string, maxLength?: number): string {
  const digits = toEnglishDigits(value).replace(/\D/g, '')
  return maxLength != null ? digits.slice(0, maxLength) : digits
}

/** Round GPS coordinate to 6 decimal places (matches backend DecimalField) */
export function roundCoordinate(value: number): number {
  return parseFloat(value.toFixed(6))
}
