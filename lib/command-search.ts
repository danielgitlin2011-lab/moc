export interface Searchable {
  id: string;
  label: string;
  /** Extra text that should match but is not the visible title. */
  keywords?: string;
}

/**
 * Subsequence scoring, in the spirit of an editor's file finder: "gal" finds
 * "Gallery", and "wedcake" finds "Wedding cake". Consecutive and word-initial
 * matches score higher so the obvious result stays on top.
 *
 * Returns null when the query is not a subsequence of the candidate at all.
 */
export function scoreMatch(query: string, candidate: string): number | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;

  const haystack = candidate.toLowerCase();
  let score = 0;
  let cursor = 0;
  let previousIndex = -1;

  for (const character of needle) {
    if (character === " ") continue;
    const index = haystack.indexOf(character, cursor);
    if (index === -1) return null;

    if (index === previousIndex + 1) score += 6;
    if (index === 0 || /[\s\-/·]/.test(haystack[index - 1])) score += 8;
    // Later matches are worth less, so a prefix hit beats a hit buried deep.
    score += Math.max(0, 12 - index);

    previousIndex = index;
    cursor = index + 1;
  }

  // Prefer the tighter of two candidates that both match.
  return score - Math.max(0, candidate.length - needle.length) * 0.12;
}

/** Ranks items against a query, dropping the ones that do not match at all. */
export function rankCommands<T extends Searchable>(query: string, items: T[], limit = 12): T[] {
  if (!query.trim()) return items.slice(0, limit);

  return items
    .map(item => {
      const label = scoreMatch(query, item.label);
      const keyword = item.keywords ? scoreMatch(query, `${item.label} ${item.keywords}`) : null;
      const best = label === null ? keyword : keyword === null ? label : Math.max(label, keyword * 0.85);
      return { item, score: best };
    })
    .filter((entry): entry is { item: T; score: number } => entry.score !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.item);
}
