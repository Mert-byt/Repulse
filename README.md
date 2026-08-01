# Repulse

Smart GitHub Repository Finder — searches repositories **by functionality**, across names, descriptions, topics and README content. Read-only, web-based, and works entirely in your browser.

**Live:** <https://mert-byt.github.io/Repulse>

## Features

- **Smart Search** — understands natural-language sentences (Turkish & English), strips stop words, and searches name + description + topics + README in parallel
- **Deduplicated Results** — multiple GitHub API queries are merged client-side and duplicates are removed
- **Sort Options** — by stars, last updated, or forks
- **Discover Mode** — an empty search loads popular repositories automatically
- **Infinite Scroll** — more results load automatically as you scroll
- **Favorites** — stored in `localStorage`, with recommendations generated from your likes
- **Safe** — read-only; never downloads, executes or collects anything
- **Keyboard Shortcuts** — `Ctrl/⌘ + K` focuses the search box, `Esc` clears it

## How It Works

The site is 100% static and talks directly to the [GitHub Search API](https://docs.github.com/en/rest/search) from the browser — no backend required. It runs the query twice (name/description/topics + README), merges and deduplicates the results, then renders them with `framer-motion` animations.

> **Note:** The public GitHub API is rate-limited to 60 requests/hour per IP without a token. The API is only used for read-only search requests.

## Deployment (GitHub Pages)

The site deploys automatically from the `main` branch via GitHub Pages:

1. In the repo: **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: `main`, path: `/` (root)
3. The site is served at `https://<username>.github.io/Repulse/`

All asset paths are relative, so the site works under any sub-path.

## Project Structure

```
├── index.html              # Single-page app (Search / Security / Favorites)
├── css/
│   ├── style.css           # Monochrome design system
│   └── filter.css          # Sort dropdown menu
├── js/
│   ├── main.js             # App logic + GitHub API client
│   └── vendor/motion.min.js # framer-motion DOM build (standalone)
└── images/
    └── favicon.svg         # Brand mark
```

## License

ISC — see [LICENSE](LICENSE)
