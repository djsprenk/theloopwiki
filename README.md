# The Loop Wiki

This repo publishes [wiki.theloop.community](https://wiki.theloop.community),
the public wiki for The Loop's DJ course. Its `gh-pages` branch is what
GitHub Pages serves; `main` holds the site config and theme.

Content is filtered and pushed here from a shared Obsidian vault by tooling
in a separate repo, [`theloopwiki-tools`](https://github.com/djsprenk/theloopwiki-tools).

Built with [Quartz](https://quartz.jzhao.xyz/), a static site generator for
publishing digital gardens and notes.

## Local development

To preview the site with content already filtered into `../content` (see
`theloopwiki-tools`'s `publish.sh` / `filter.py`), run from this directory:

```
npx quartz build --serve --directory ../content
```

This builds and serves the site locally with live-reload, without deploying
anything. Use it to iterate on theme/config changes in `quartz.config.yaml`
and `quartz/styles/`.
