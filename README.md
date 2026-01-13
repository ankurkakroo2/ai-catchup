# AI Catchup v2.0 🤖

A beautiful terminal-based CLI for curated AI news from premium sources, built with Bun and OpenTUI.

## ✨ Features

- 🎨 **Beautiful OpenTUI Interface** - Modern, smooth terminal UI with React
- 📰 **Multiple News Sources** - RSS, Hacker News, Reddit, X/Twitter, SmolAI
- 🔄 **Smart Caching** - Fast subsequent loads with offline support
- 🔍 **Search & Filter** - Find relevant content quickly
- 📊 **Intelligent Scoring** - Prioritizes recent, high-engagement content
- 📱 **Article Details** - Full article view with smooth scrolling
- ⌨️ **Full Keyboard Support** - Vim-style navigation and help overlays
- 🎯 **Configurable** - Extensive CLI flags and source configuration

## 🚀 Quick Start

### Installation

```bash
# Install globally with Bun
bun install -g ai-catchup

# Or run directly without installing
bunx ai-catchup
```

### Basic Usage

```bash
# Run with default settings
ai-catchup

# Fetch specific number of items
ai-catchup --limit 15

# Filter by sources (hn, reddit, x, smol)
ai-catchup --sources hn,reddit

# Bypass cache
ai-catchup --no-cache

# Search/filter content
ai-catchup --search "llm agents"

# Filter by minimum score
ai-catchup --min-score 2.5

# Filter by age
ai-catchup --max-age-hours 48
```

## ⌨️ Keyboard Shortcuts

### News List View

- `↑↓` - Navigate up/down through articles
- `Enter`/`Space`/`o` - Open article detail view
- `r` - Refresh news feed
- `?` - Show help overlay
- `q`/`Escape` - Quit application
- `Ctrl+C` - Force quit

### Article Detail View

- `↑↓`/`j`/`k` - Scroll through article content
- `g` - Jump to top
- `G` - Jump to bottom
- `q`/`Escape` - Return to list view
- `?` - Show help overlay
- `Ctrl+C` - Force quit

## 📊 News Scoring

Articles are automatically scored based on:

- **Recency**: More recent articles get higher scores (decay over 72 hours)
- **Engagement**: Upvotes, comments, points
- **Relevance**: Tags related to AI/LLMs/agents/retrieval get bonus

Score range typically: 0-6+ (higher is better)

## 🔧 Configuration

### CLI Options

| Option                 | Description                                | Default       |
| ---------------------- | ------------------------------------------ | ------------- |
| `-l, --limit <n>`      | Maximum news items to fetch                | 20            |
| `-s, --sources <list>` | Comma-separated sources (hn,reddit,x,smol) | All enabled   |
| `--no-cache`           | Bypass cache when fetching                 | Cache enabled |
| `--max-age-hours <n>`  | Maximum age of items in hours              | 72            |
| `--min-score <n>`      | Minimum score threshold                    | 0             |
| `--search <query>`     | Search/filter string                       | None          |

### Source Configuration

Edit `config/sources.config.json` to customize sources:

```json
{
  "cache": { "ttl": 1800000 },
  "global": {
    "limit": 20,
    "perSourceCap": 6,
    "hardBlock": ["funding", "hiring", "press"]
  },
  "sources": [
    {
      "name": "smol",
      "type": "rss",
      "enabled": true,
      "feedUrl": "https://news.smol.ai/feed.xml",
      "limit": 6
    },
    {
      "name": "reddit",
      "type": "reddit",
      "enabled": true,
      "subreddits": ["ClaudeAI", "LocalLLaMA", "MachineLearning"],
      "minUpvotes": 75,
      "maxAgeHours": 72,
      "limit": 6
    }
  ]
}
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck

# Lint
bun run lint
```

## 🏗️ Architecture

```
src/
├── cli.tsx              # CLI entry point with commander
├── components/
│   ├── App.tsx        # Main application component
│   ├── NewsList.tsx    # News list view with selection
│   ├── ArticleView.tsx  # Article detail view with scrolling
│   └── UI.tsx         # Reusable UI components
├── services/
│   ├── aggregator.ts  # News fetching & scoring
│   ├── cache.ts       # Local cache management
│   └── config.ts      # Configuration loading
└── sources/
    ├── base.ts        # Base source class & types
    ├── rss.ts         # Generic RSS feed adapter
    ├── hackernews.ts  # Hacker News API adapter
    ├── reddit.ts      # Reddit API adapter
    ├── x.ts           # X/Twitter adapter
    ├── smol.ts        # SmolAI RSS adapter
    └── index.ts       # Source factory
```

## 🎨 UI Components

The app uses **OpenTUI** - a modern React-based terminal UI framework built specifically for Bun:

- `box` - Container component with borders, padding, flexbox layout
- `text` - Text rendering with colors (`fg`), bold (`<b>`/`<strong>`), dim
- `<span>` - Inline text styling
- `<br>` - Line breaks
- `<a>` - Links
- `useKeyboard` - Hook for keyboard event handling

## 📦 Tech Stack

- **Runtime**: Bun (JavaScript runtime with native bundling)
- **UI Framework**: OpenTUI (@opentui/react) - React for terminals
- **Language**: TypeScript (strict mode)
- **HTTP Client**: Axios
- **Date Formatting**: date-fns
- **Feed Parsing**: rss-parser
- **CLI Framework**: Commander

## 🔄 Migration from v1.0

This is a complete rewrite using OpenTUI instead of Ink:

- ✅ **Better performance** - Native Bun runtime, faster rendering
- ✅ **More consistent** - Single rendering engine
- ✅ **Modern React** - Uses React 19 with latest hooks
- ✅ **Better scrolling** - Improved scrollbox implementation
- ✅ **Cleaner code** - TypeScript throughout

The CLI interface and features remain the same - your muscle memory will work!

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏️ Acknowledgments

- **OpenTUI** - Beautiful TUI framework for Bun
- **ralph-tui** - Inspiration for OpenTUI patterns and beautiful UI design
- **React 19** - UI component model
- **rss-parser** - RSS feed parsing
- **date-fns** - Date formatting utilities
- **Bun** - All-in-one JavaScript runtime and toolchain

Built with ❤️ for developers who love staying updated on AI!
