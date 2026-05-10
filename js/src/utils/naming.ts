/**
 * Shared discriminator extraction for legend / picker rows.
 *
 * When several curves share the same name prefix (e.g.
 *   "Kleiderschrank - Magic Area Akzent"
 *   "Kleiderschrank - Magic Area Decke"
 *   "Kleiderschrank - Magic Area Schreibtisch"
 * ),  the prefix carries no information and eats every label's
 * discriminating suffix on a narrow viewport. This helper returns
 * the (prefix, discriminator) split per name so the caller can render
 * the unique part as the primary, bold line and the prefix as muted
 * secondary text — or strip the prefix entirely when desired.
 *
 * Pure data, no DOM. Inputs:
 *   names — array of friendly names from the curve set.
 * Returns: array of { prefix, discriminator } in the same order.
 *
 * Rules:
 *   - With <2 names, return {prefix: '', discriminator: name} for each.
 *   - The prefix is the longest character run shared by ALL names, ending
 *     at the last token boundary (whitespace, dash, en-dash, slash, colon).
 *   - The discriminator is `name.slice(prefix.length).trimStart()`.
 *   - If the longest shared prefix would leave one or more discriminators
 *     empty, fall back to {prefix: '', discriminator: name}. Returning an
 *     empty discriminator is worse than returning the full name.
 */

const TOKEN_BOUNDARY = /[\s\-–—/:]/;

export interface NamePart {
  prefix: string;
  discriminator: string;
}

export function discriminator(names: readonly string[]): NamePart[] {
  if (names.length < 2) {
    return names.map((name) => ({ prefix: '', discriminator: name }));
  }

  // Longest character prefix shared by all names.
  let prefixLen = names[0].length;
  for (let i = 1; i < names.length; i++) {
    const a = names[0];
    const b = names[i];
    let j = 0;
    while (j < prefixLen && j < b.length && a.charCodeAt(j) === b.charCodeAt(j)) j++;
    prefixLen = j;
    if (prefixLen === 0) break;
  }

  // Roll back to the last token boundary so we don't slice mid-word.
  const sample = names[0];
  while (prefixLen > 0 && !TOKEN_BOUNDARY.test(sample[prefixLen - 1])) {
    prefixLen--;
  }
  // Then trim trailing boundary characters from the prefix itself so the
  // discriminator does not start with the same separator on every row.
  let trimmedLen = prefixLen;
  while (trimmedLen > 0 && TOKEN_BOUNDARY.test(sample[trimmedLen - 1])) {
    trimmedLen--;
  }

  if (trimmedLen === 0) {
    return names.map((name) => ({ prefix: '', discriminator: name }));
  }

  const prefix = sample.slice(0, trimmedLen);
  const parts = names.map((name) => ({
    prefix,
    discriminator: name.slice(prefixLen).replace(/^[\s\-–—/:]+/, ''),
  }));

  if (parts.some((p) => p.discriminator.length === 0)) {
    return names.map((name) => ({ prefix: '', discriminator: name }));
  }

  return parts;
}
