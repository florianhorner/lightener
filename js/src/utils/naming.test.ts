import { describe, expect, it } from 'vitest';
import { discriminator } from './naming.js';

describe('discriminator helper', () => {
  it('returns the full name when only one name is given', () => {
    expect(discriminator(['Kleiderschrank Akzent'])).toEqual([
      { prefix: '', discriminator: 'Kleiderschrank Akzent' },
    ]);
  });

  it('extracts the unique suffix when names share a prefix', () => {
    const result = discriminator([
      'Kleiderschrank - Magic Area Akzent',
      'Kleiderschrank - Magic Area Decke',
      'Kleiderschrank - Magic Area Schreibtisch',
    ]);
    expect(result.map((p) => p.discriminator)).toEqual(['Akzent', 'Decke', 'Schreibtisch']);
    // Prefix is identical for every row — the leading separator/dash chars are
    // trimmed off the prefix tail so it doesn't end with " - ".
    const prefixes = new Set(result.map((p) => p.prefix));
    expect(prefixes.size).toBe(1);
    expect([...prefixes][0]).toBe('Kleiderschrank - Magic Area');
  });

  it('falls back to full names when one name is a strict prefix of another', () => {
    // "Foo" is fully contained in "Foo Bar"; trimming the shared "Foo "
    // leaves the first row with an empty discriminator. Showing nothing
    // for that row is worse than showing the full name on every row.
    const result = discriminator(['Foo', 'Foo Bar']);
    expect(result.map((p) => p.discriminator)).toEqual(['Foo', 'Foo Bar']);
    expect(result.every((p) => p.prefix === '')).toBe(true);
  });

  it('returns full names when there is no shared token prefix', () => {
    const result = discriminator(['Living Room', 'Kitchen', 'Bathroom']);
    expect(result.map((p) => p.discriminator)).toEqual(['Living Room', 'Kitchen', 'Bathroom']);
    expect(result.every((p) => p.prefix === '')).toBe(true);
  });

  it('does not split mid-word', () => {
    // Without token-boundary alignment, the longest character prefix would
    // chop "Bedroom" / "Bedside" at "Beds…" — incorrect. Roll back to the
    // last whitespace/dash/etc. instead.
    const result = discriminator(['Bedroom Light', 'Bedside Lamp']);
    expect(result.every((p) => p.prefix === '')).toBe(true);
  });
});
