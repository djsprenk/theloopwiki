import { QuartzTransformerPlugin } from '@quartz-community/types';
export { QuartzTransformerPlugin } from '@quartz-community/types';

interface RelatedLinksOptions {
    /** Frontmatter property to read wikilinks from. */
    propertyName: string;
    /** Heading text rendered above the links. */
    heading: string;
    /** Frontmatter property holding a single "next page" wikilink. */
    nextPropertyName: string;
    /** Heading text rendered above the next-page link. */
    nextHeading: string;
}
declare const RelatedLinks: QuartzTransformerPlugin<Partial<RelatedLinksOptions>>;

export { RelatedLinks, type RelatedLinksOptions };
