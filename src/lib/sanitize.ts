/**
 * Sanitiza strings prevenindo a injeção de scripts e tags HTML (Stored XSS)
 */
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
