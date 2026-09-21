/**
 * Gives every Markdown table its own horizontal scroll container.
 *
 * Typography renders tables as `width: 100%; table-layout: auto`, which reads
 * well on a wide screen but cannot shrink below the table's min-content width.
 * The commit-count table in the hackathon postmortem needs ~440px for its five
 * columns, so on a phone it overflowed the prose column and took the whole
 * document with it — a horizontal scrollbar on the page, not on the table.
 *
 * Wrapping the table keeps the overflow local: the wrapper scrolls, the page
 * doesn't. `role="region"` plus `tabindex="0"` is the usual pairing so the
 * scrollable area is reachable by keyboard and announced by a screen reader.
 */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

export default function rehypePostTables() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        walk(child);

        if (child.tagName !== 'table') return child;

        return {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-scroll'],
            role: 'region',
            tabindex: 0,
            'aria-label': 'Tabela, rolável horizontalmente'
          },
          children: [child]
        } satisfies HastNode;
      });
    };

    walk(tree);
  };
}
