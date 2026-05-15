/**
 * Convert a free-form title into a URL-friendly slug.
 * Lowercases, strips diacritics, collapses non-alphanumerics into single
 * hyphens, and trims leading/trailing hyphens. Returns an empty string for
 * inputs that contain no usable characters.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}
