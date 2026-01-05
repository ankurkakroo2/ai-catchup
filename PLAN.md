# AI CatchUp - Terminal CLI for AI News

## Project Overview
A fast, terminal-based CLI tool for developers to stay updated with high-quality AI news from curated sources. The tool will aggregate content from premium sources and present it in a clean, developer-friendly interface.

## Core Features

### MVP (Minimum Viable Product)
1. **Fetch Latest AI News** - Get today's AI news from curated sources
2. **Multiple Source Support** - Aggregate from smol.ai and Twitter
3. **Terminal UI** - Clean, readable interface with syntax highlighting
4. **Filtering** - Filter by keywords, sources, or topics
5. **Caching** - Cache responses to avoid rate limits and improve speed
6. **Offline Reading** - Save articles for later

### Nice-to-Have Features
- **Bookmarking** - Save interesting articles
- **RSS Feed Reader** - Support custom RSS feeds
- **Notification Mode** - Get alerts for breaking AI news
- **Search History** - Search through past news items

## Data Sources

### Phase 1: Primary Sources
1. **news.smol.ai** (RSS Feed)
   - Aggregates from 500+ Twitter accounts, 12 subreddits, 24 Discord servers
   - Daily summaries of AI developments
   - RSS feed available at news.smol.ai/subscribe
   - Already curated for quality

2. **Twitter/X** (API or RSS)
   - Follow specific AI researchers and companies
   - Curated list of high-signal accounts (e.g., @AnthropicAI, @OpenAI, @GoogleAI)
   - Options: Twitter API v2 (requires auth) or third-party RSS bridges

### Phase 2: Additional Sources (Optional)
- Hacker News (AI-related posts)
- Reddit (r/MachineLearning, r/LocalLLaMA, r/artificial)
- Hugging Face Blog
- Google AI Blog
- OpenAI Blog
- Anthropic News

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                CLI Interface                     │
│  (Commander.js + Ink/Blessed for rich UI)       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│           Core Application Layer                │
│  - Command Router                               │
│  - News Aggregator                              │
│  - Cache Manager                                │
│  - Config Manager                               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Data Source Adapters                 │
│  - smol.ai RSS Parser                           │
│  - Twitter API Client                           │
│  - Generic RSS Parser (for future sources)      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│              Data Storage                       │
│  - Local Cache (JSON files or SQLite)           │
│  - Config File (~/.ai-catchup/config.json)      │
│  - Bookmarks Storage                            │
└─────────────────────────────────────────────────┘
```

## Tech Stack (Node.js)

### Core Dependencies
- **commander** - CLI framework for command parsing
- **ink** or **blessed** - Rich terminal UI components
- **axios** - HTTP client for API calls
- **rss-parser** - Parse RSS feeds
- **node-cache** - In-memory caching
- **chalk** - Terminal string styling
- **ora** - Elegant terminal spinners
- **configstore** - Configuration management
- **date-fns** - Date formatting

### Development Tools
- **TypeScript** - Type safety (optional but recommended)
- **ESLint + Prettier** - Code quality
- **pkg** or **nexe** - Bundle into executable (optional)

## CLI Interface Design

### Commands

```bash
# Get today's AI news (default command)
ai-catchup
ai-catchup today

# Get news from specific source
ai-catchup --source smol
ai-catchup --source twitter

# Filter by keywords
ai-catchup --filter "GPT,Claude,LLM"

# Show last N items
ai-catchup --limit 10

# Interactive mode (navigate with arrow keys)
ai-catchup --interactive

# Search past news
ai-catchup search "transformer architecture"

# Manage bookmarks
ai-catchup bookmarks
ai-catchup bookmark add <id>

# Configure sources and preferences
ai-catchup config
ai-catchup config set source.twitter.enabled false

# Show version and help
ai-catchup --version
ai-catchup --help
```

### UI Mockup (Terminal Output)

```
╔════════════════════════════════════════════════════════════╗
║  AI CatchUp - Latest AI News (Jan 5, 2026)                ║
╚════════════════════════════════════════════════════════════╝

📰 smol.ai • 2 hours ago
──────────────────────────────────────────────────────────────
  Claude 4.5 Sonnet Sets New Benchmarks
  Anthropic releases upgraded model with improved reasoning
  🔗 https://news.smol.ai/issues/...
  #LLM #Anthropic #Claude

📰 @karpathy • 5 hours ago
──────────────────────────────────────────────────────────────
  New paper on scaling laws challenges previous assumptions
  🔗 https://twitter.com/karpathy/status/...
  #Research #Scaling

📰 smol.ai • 8 hours ago
──────────────────────────────────────────────────────────────
  OpenAI Announces GPT-5 Training Complete
  Release expected Q2 2026
  🔗 https://news.smol.ai/issues/...
  #OpenAI #GPT5

──────────────────────────────────────────────────────────────
Showing 3 of 15 items • Use --limit to see more
Commands: ↑↓ navigate • Enter to open • B to bookmark • Q to quit
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Initialize Node.js project with package.json
- [ ] Set up TypeScript configuration
- [ ] Implement basic CLI structure with Commander.js
- [ ] Create configuration management system
- [ ] Set up project structure and folders

### Phase 2: Data Sources (Week 1-2)
- [ ] Implement smol.ai RSS parser
  - Find and parse news.smol.ai RSS feed
  - Extract articles, titles, links, dates
  - Handle errors and edge cases
- [ ] Implement Twitter integration
  - Research best approach (API vs RSS)
  - Set up authentication if needed
  - Parse tweets from curated accounts
- [ ] Create generic RSS parser for future sources

### Phase 3: Core Features (Week 2)
- [ ] Build news aggregator
  - Combine multiple sources
  - Sort by date/relevance
  - Deduplicate similar content
- [ ] Implement caching system
  - Cache API responses (1-hour TTL)
  - Store locally for offline access
  - Handle cache invalidation
- [ ] Add filtering and search
  - Keyword filtering
  - Source filtering
  - Date range filtering

### Phase 4: UI/UX (Week 3)
- [ ] Design terminal UI with Ink or Blessed
  - List view with colors and icons
  - Interactive navigation
  - Article preview
- [ ] Add spinner and loading states
- [ ] Implement error handling and user feedback
- [ ] Add help documentation

### Phase 5: Polish & Distribution (Week 3-4)
- [ ] Add bookmarking feature
- [ ] Write tests for core functionality
- [ ] Create comprehensive README
- [ ] Set up npm publishing
- [ ] Optional: Create standalone executables

## Configuration File Structure

```json
{
  "sources": {
    "smol": {
      "enabled": true,
      "url": "https://news.smol.ai/feed.xml"
    },
    "twitter": {
      "enabled": true,
      "accounts": [
        "@AnthropicAI",
        "@OpenAI",
        "@GoogleAI",
        "@karpathy",
        "@ylecun"
      ]
    }
  },
  "cache": {
    "ttl": 3600,
    "enabled": true
  },
  "display": {
    "limit": 10,
    "showIcons": true,
    "theme": "dark"
  }
}
```

## Challenges & Solutions

### Challenge 1: Twitter API Access
- **Problem**: Twitter API requires authentication and has rate limits
- **Solutions**:
  - Use Twitter API v2 Free tier (if available)
  - Use RSS bridges like nitter.net or RSS-Bridge
  - Start with smol.ai (already aggregates Twitter)
  - Add direct Twitter later as enhancement

### Challenge 2: Content Quality
- **Problem**: Filtering signal from noise
- **Solutions**:
  - Rely on pre-curated sources (smol.ai)
  - Implement keyword filtering
  - Allow user customization of sources
  - Add upvote/downvote to learn preferences (future)

### Challenge 3: Rate Limiting
- **Problem**: APIs have rate limits
- **Solutions**:
  - Aggressive caching (1-hour default)
  - Batch requests
  - Show cached content when offline
  - Respect API limits with exponential backoff

## Success Metrics
- Fast startup time (< 2 seconds)
- Fresh content (< 1 hour old)
- High signal-to-noise ratio
- Easy to use (< 3 commands to learn)
- Reliable (works offline with cache)

## Future Enhancements
- GitHub trending AI repos
- Arxiv AI paper summaries
- AI company blogs (Anthropic, OpenAI, Google DeepMind)
- Podcast episode listings
- YouTube channel updates
- Integration with read-it-later services
- Export to markdown/PDF
- Web dashboard companion
- AI-powered summarization of articles
