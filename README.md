# AI News 📰🤖

A fast, terminal-based CLI tool for developers to stay updated with high-quality AI news from curated sources.

<img width="2554" height="1616" alt="image" src="https://github.com/user-attachments/assets/b49d1fe1-31ca-466c-b5d2-4951d32684e6" />


## Features

- 📰 **Curated AI News** - Get the latest AI news from premium sources (smol.ai, Reddit)
- ⌨️ **Rich Terminal UI** - Beautiful, interactive interface with keyboard navigation
- 🚀 **Fast & Offline** - Caching support for quick access and offline reading
- 🎯 **Developer-Focused** - Clean, distraction-free news consumption
- 🔌 **Extensible** - Easy to add new sources via the sources folder
- 🖥️ **Non-Interactive Mode** - Works in scripts and CI pipelines

## Installation

### Local

```bash
npm install
npm run build
node dist/index.js --help
```

### Global executable (`ai-news` on PATH)

```bash
npm install -g .
ai-news --help
ai-news --sources smol,reddit --limit 20
```

## Usage

### Basic Commands

```bash
# Default run (uses config defaults)
ai-news

# More items
ai-news --limit 50

# Select specific sources
ai-news --sources smol,reddit

# Filter by max age (hours)
ai-news --max-age-hours 24

# Bypass cache
ai-news --no-cache

# Search/filter
ai-news --search "Claude,agents"

# Help
ai-news --help
```

### Keyboard Controls

#### News List View

- `↑` / `↓` - Navigate through news items
- `Enter` - Open selected article
- `R` - Refresh news
- `Q` - Quit application
- `Ctrl+C` - Force quit

#### Article View

- `↑` / `↓` - Scroll through content
- `g` / `G` - Jump to top/bottom
- `ESC` or `Q` - Go back to list
- `Ctrl+C` - Force quit

## Configuration

Configuration is stored in `config/sources.config.json`:

```json
{
  "cache": { "ttl": 1800000 },
  "global": { "limit": 20, "perSourceCap": 6 },
  "sources": [
    {
      "name": "smol",
      "type": "smol",
      "enabled": true,
      "feedUrl": "https://news.smol.ai/rss.xml",
      "limit": 6
    },
    {
      "name": "reddit",
      "type": "reddit",
      "enabled": true,
      "subreddits": ["ClaudeAI", "LocalLLaMA", "MachineLearning"],
      "limit": 6
    }
  ]
}
```

## Data Sources

### Current Sources

1. **smol.ai** - Aggregates AI news from 500+ Twitter accounts, 12 subreddits, and 24 Discord servers (daily digests)
2. **Reddit** - Curated subreddits: ClaudeAI, LocalLLaMA, MachineLearning, OpenAI, LangChain, ArtificialInteligence, ChatGPT, Cursor, SideProject, LearnMachineLearning

### Disabled Sources

- **X/Twitter** - Disabled due to Twitter API changes. Public RSS feeds (Nitter instances) are blocked or return 403 errors.

### Adding New Sources

To add a new source:

1. Create a new file in `src/sources/` (e.g., `hackernews.js`)
2. Extend the `BaseSource` class
3. Implement the `fetchNews()` method
4. Register in `src/sources/index.js`
5. Add configuration in `config/sources.config.json`

Example:

```javascript
import { BaseSource } from "./base.js";

export class MySource extends BaseSource {
  constructor(config = {}) {
    super("my-source", config);
  }

  async fetchNews() {
    // Fetch and return news items
    return [
      {
        id: "unique-id",
        title: "Article Title",
        description: "Summary",
        link: "https://example.com",
        pubDate: new Date(),
        source: this.name,
        tags: ["AI", "ML"],
        content: "Full content...",
      },
    ];
  }
}
```

## Architecture

```
ai-catchup/
├── bin/
│   └── ai-news.js              # CLI entry point
├── config/
│   └── sources.config.json     # Source configurations
├── src/
│   ├── index.js                # CLI setup with commander
│   ├── cli/
│   │   └── ui/
│   │       ├── App.js          # Main app component
│   │       ├── NewsList.js     # News list view
│   │       ├── ArticleView.js  # Article detail view
│   │       └── theme.js        # UI theme constants
│   ├── sources/                # News source adapters
│   │   ├── base.js             # Base source class
│   │   ├── smol.js             # smol.ai adapter
│   │   ├── reddit.js           # Reddit adapter
│   │   ├── hackernews.js       # Hacker News adapter
│   │   ├── rss.js              # Generic RSS adapter
│   │   ├── x.js                # X/Twitter adapter (disabled)
│   │   └── index.js            # Source factory
│   ├── services/
│   │   ├── aggregator.js       # News aggregation & scoring
│   │   ├── cache.js            # Caching service
│   │   └── config.js           # Configuration management
│   └── utils/
├── package.json
└── README.md
```

## Cache

News items are cached locally for:

- Faster loading
- Offline access
- Reduced API calls

Cache TTL: 30 minutes (configurable in `config/sources.config.json`)

## Development

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Run with custom options
npm run dev -- --sources smol --limit 10
```

## Tech Stack

- **Node.js** - Runtime
- **Ink** - React for CLIs
- **Commander** - CLI framework
- **rss-parser** - RSS feed parsing
- **axios** - HTTP client
- **chalk** - Terminal styling
- **date-fns** - Date formatting
- **node-cache** - In-memory caching

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
