// src/transformer.ts
var defaultOptions = {
  propertyName: "related",
  heading: "See Also"
};
var WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
function parseWikilinks(value) {
  const entries = Array.isArray(value) ? value : [value];
  const links = [];
  for (const entry of entries) {
    if (typeof entry !== "string") continue;
    WIKILINK_PATTERN.lastIndex = 0;
    let match;
    while ((match = WIKILINK_PATTERN.exec(entry)) !== null) {
      const path = match[1].trim();
      const alias = match[2]?.trim();
      if (path) links.push({ path, alias: alias || void 0 });
    }
  }
  return links;
}
function joinOxfordComma(nodes) {
  const children = [];
  nodes.forEach((node, i) => {
    if (i > 0) {
      const isLast = i === nodes.length - 1;
      const sep = isLast ? nodes.length > 2 ? ", and " : " and " : ", ";
      children.push({ type: "text", value: sep });
    }
    children.push(node);
  });
  return children;
}
var RelatedLinks = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "RelatedLinks",
    markdownPlugins() {
      return [
        () => {
          return (tree, file) => {
            const rawValue = file.data.frontmatter?.[opts.propertyName];
            const links = parseWikilinks(rawValue);
            if (links.length === 0) return;
            const wikilinkNodes = links.map(({ path, alias }) => ({
              type: "wikilink",
              path,
              alias,
              embedded: false
            }));
            const heading = {
              type: "heading",
              depth: 2,
              children: [{ type: "text", value: opts.heading }]
            };
            const paragraph = {
              type: "paragraph",
              children: joinOxfordComma(wikilinkNodes)
            };
            tree.children.push(heading, paragraph);
          };
        }
      ];
    }
  };
};

export { RelatedLinks };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map