import type { QuartzTransformerPlugin } from "@quartz-community/types";
import type { PluggableList } from "unified";
import type { Root, Heading, Paragraph, PhrasingContent, Node } from "mdast";
import type { VFile } from "vfile";

export interface RelatedLinksOptions {
  /** Frontmatter property to read wikilinks from. */
  propertyName: string;
  /** Heading text rendered above the links. */
  heading: string;
  /** Frontmatter property holding a single "next page" wikilink. */
  nextPropertyName: string;
  /** Heading text rendered above the next-page link. */
  nextHeading: string;
}

const defaultOptions: RelatedLinksOptions = {
  propertyName: "related",
  heading: "See Also",
  nextPropertyName: "next",
  nextHeading: "Next Up",
};

// Same shape @quartz-community/remark-obsidian produces for `[[Target|Alias]]`
// wikilinks, and what obsidian-flavored-markdown's own markdownPlugins step
// (order 30) visits and converts into real links. Constructing this node type
// directly here — rather than resolving hrefs ourselves — means related links
// get identical resolution/broken-link handling to body wikilinks for free.
type WikilinkNode = Node & {
  type: "wikilink";
  path?: string;
  alias?: string;
  embedded?: boolean;
};

const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function parseWikilinks(value: unknown): { path: string; alias?: string }[] {
  const entries = Array.isArray(value) ? value : [value];
  const links: { path: string; alias?: string }[] = [];
  for (const entry of entries) {
    if (typeof entry !== "string") continue;
    WIKILINK_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = WIKILINK_PATTERN.exec(entry)) !== null) {
      const path = match[1]!.trim();
      const alias = match[2]?.trim();
      if (path) links.push({ path, alias: alias || undefined });
    }
  }
  return links;
}

function joinOxfordComma(nodes: WikilinkNode[]): PhrasingContent[] {
  const children: PhrasingContent[] = [];
  nodes.forEach((node, i) => {
    if (i > 0) {
      const isLast = i === nodes.length - 1;
      const sep = isLast ? (nodes.length > 2 ? ", and " : " and ") : ", ";
      children.push({ type: "text", value: sep });
    }
    children.push(node as unknown as PhrasingContent);
  });
  return children;
}

export const RelatedLinks: QuartzTransformerPlugin<Partial<RelatedLinksOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };

  return {
    name: "RelatedLinks",
    markdownPlugins(): PluggableList {
      return [
        () => {
          return (tree: Root, file: VFile) => {
            const rawValue = file.data.frontmatter?.[opts.propertyName];
            const links = parseWikilinks(rawValue);
            if (links.length > 0) {
              const wikilinkNodes: WikilinkNode[] = links.map(({ path, alias }) => ({
                type: "wikilink",
                path,
                alias,
                embedded: false,
              }));

              const heading: Heading = {
                type: "heading",
                depth: 2,
                children: [{ type: "text", value: opts.heading }],
              };
              const paragraph: Paragraph = {
                type: "paragraph",
                children: joinOxfordComma(wikilinkNodes),
              };

              tree.children.push(heading, paragraph);
            }

            const rawNextValue = file.data.frontmatter?.[opts.nextPropertyName];
            const [nextLink] = parseWikilinks(rawNextValue);
            if (nextLink) {
              const nextHeading: Heading = {
                type: "heading",
                depth: 2,
                children: [{ type: "text", value: opts.nextHeading }],
              };
              const nextWikilinkNode: WikilinkNode = {
                type: "wikilink",
                path: nextLink.path,
                alias: nextLink.alias,
                embedded: false,
              };
              const nextParagraph: Paragraph = {
                type: "paragraph",
                children: [nextWikilinkNode as unknown as PhrasingContent],
              };

              tree.children.push(nextHeading, nextParagraph);
            }
          };
        },
      ];
    },
  };
};
