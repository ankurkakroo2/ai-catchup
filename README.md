# AI CatchUp 🤖📰

A fast, terminal-based CLI tool for developers to stay updated with high-quality AI news from curated sources.

## Features

- 📰 **Curated AI News** - Get the latest AI news from premium sources (smol.ai)
- ⌨️ **Rich Terminal UI** - Beautiful, interactive interface with keyboard navigation
- 🚀 **Fast & Offline** - Caching support for quick access and offline reading
- 🎯 **Developer-Focused** - Clean, distraction-free news consumption
- 🔌 **Extensible** - Easy to add new sources via the sources folder

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage (optional)
npm link
```

## Usage

### Basic Commands

```bash
# Fetch and display latest AI news
ai-catchup

# Show more items
ai-catchup --limit 50

# Show version
ai-catchup --version

# Show help
ai-catchup --help
```

### Keyboard Controls

#### News List View

- `↑` / `↓` - Navigate through news items
- `Enter` - Open selected article
- `Q` - Quit application
- `Ctrl+C` - Force quit

#### Article View

- `↑` / `↓` - Scroll through content
- `ESC` or `Q` - Go back to list
- `Ctrl+C` - Force quit

## Testing

See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for comprehensive testing strategy.

### Integration Tests

Integration tests verify CLI commands and data layer work correctly without UI.

```bash
npm run test:run -- tests/integration/cli.test.js
```

Current coverage:

- CLI commands (clear-cache, config, version, help)
- Data layer (NewsAggregator, ConfigService, CacheService)
- Source adapters (SmolSource, HackerNewsSource, RedditSource)

### Architecture

```
ai-catchup/
├── src/
│   ├── index.js                 # CLI entry point
│   ├── cli/
│   │   ├── App.js           # Main app component
│   │   ├── NewsList.js      # News list view
│   │   └── ArticleView.js   # Article detail view
│   ├── sources/                 # News source adapters
│   │   ├── base.js              # Base source class
│   │   ├── smol.js              # smol.ai adapter
│   │   ├── x.js                # X (Twitter) adapter
│   │   ├── rss.js              # Generic RSS adapter
│   │   ├── hackernews.js        # HackerNews adapter
│   │   ├── reddit.js            # Reddit adapter
│   │   └── index.js           # Source registry
│   ├── services/
│   │   ├── aggregator.js        # News aggregation logic
│   │   ├── cache.js             # Caching service
│   │   └── config.js            # Configuration management
│   └── utils/
└── package.json
```

```
ai-catchup/
├── src/
│   ├── index.js                 # CLI entry point
│   ├── cli/
│   │   └── ui/
│   │       ├── App.js           # Main app component
│   │       ├── NewsList.js      # News list view
│   │       └── ArticleView.js   # Article detail view
│   ├── sources/                 # News source adapters
│   │   ├── base.js              # Base source class
│   │   ├── smol.js              # smol.ai adapter
│   │   └── index.js             # Source registry
│   ├── services/
│   │   ├── aggregator.js        # News aggregation logic
│   │   ├── cache.js             # Caching service
│   │   └── config.js            # Configuration management
│   └── utils/
├── package.json
└── README.md
```

## Data Sources

### Current Sources

1. **smol.ai** - Aggregates AI news from 500+ Twitter accounts, 12 subreddits, and 24 Discord servers

### Adding New Sources

To add a new source:

1. Create a new file in `src/sources/` (e.g., `twitter.js`)
2. Extend the `BaseSource` class
3. Implement the `fetchNews()` method
4. Register in `src/sources/index.js`
5. Add configuration in `~/.config/ai-catchup/config.json`

Example:

```javascript
import { BaseSource } from './base.js';

export class MySource extends BaseSource {
  constructor(config = {}) {
    super('my-source', config);
  }

  async fetchNews() {
    // Fetch and return news items
    return [
      {
        id: 'unique-id',
        title: 'Article Title',
        description: 'Summary',
        link: 'https://example.com',
        pubDate: new Date(),
        source: this.name,
        tags: ['AI', 'ML'],
        content: 'Full content...',
      },
    ];
  }
}
```

## Configuration

Configuration is stored in `~/.config/ai-catchup/config.json`:

```json
{
  "sources": {
    "smol": {
      "enabled": true,
      "url": "https://news.smol.ai/feed.xml"
    }
  },
  "cache": {
    "enabled": true,
    "ttl": 3600000
  },
  "display": {
    "limit": 20,
    "showIcons": true
  }
}
```

## Cache

News items are cached locally in `~/.ai-catchup/cache/` for:

- Faster loading
- Offline access
- Reduced API calls

Cache TTL: 1 hour (configurable)

## Development

```bash
# Run in development mode
npm run dev

# Run with custom limit
npm run dev -- --limit 50
```

## Tech Stack

- **Node.js** - Runtime
- **Ink** - React for CLIs
- **Commander** - CLI framework
- **rss-parser** - RSS feed parsing
- **chalk** - Terminal styling
- **date-fns** - Date formatting
- **conf** - Configuration management

## Roadmap

- [ ] Add more sources (Twitter, Hacker News, Reddit)
- [ ] Bookmarking feature
- [ ] Search functionality
- [ ] Filtering by keywords/tags
- [ ] Export to markdown
- [ ] AI-powered summarization

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
