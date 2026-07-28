/**
 * Serialises a value for embedding inside `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is not safe here. An HTML parser looking at the
 * contents of a `<script>` element does not understand JSON — it only looks for
 * the closing tag. A business whose name is `</script><script>…` therefore
 * closes our tag and opens the attacker's, and the JSON is never even parsed.
 *
 * Escaping `<` (and, for symmetry, `>` and `&`) as JSON unicode sequences makes
 * that impossible while leaving the parsed value byte-for-byte identical:
 * `"<"` and `"<"` are the same string once JSON.parse has run.
 *
 * U+2028 and U+2029 are escaped too. JSON allows them raw inside strings, but
 * they are line terminators to a JavaScript parser and break any consumer that
 * evaluates the block rather than parsing it.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
