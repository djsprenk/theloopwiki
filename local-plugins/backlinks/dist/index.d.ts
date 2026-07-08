import { QuartzComponent } from '@quartz-community/types';
export { QuartzComponent, QuartzComponentProps, StringResource } from '@quartz-community/types';

interface BacklinksOptions {
    hideWhenEmpty: boolean;
    /** Slug prefixes (e.g. "the-loop-academy") to never show backlinks for. */
    disabledPathPrefixes: string[];
}
declare const _default: (opts?: Partial<BacklinksOptions>) => QuartzComponent;

export { _default as Backlinks, type BacklinksOptions };
