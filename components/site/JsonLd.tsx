/**
 * Renders a JSON-LD block. `<` is escaped rather than left raw, so a stray
 * angle bracket in any value cannot break out of the script tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
