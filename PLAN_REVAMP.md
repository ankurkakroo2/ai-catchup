# AI CatchUp Revamp Plan

## Goals

- Developer-centric, high-signal AI news with dynamic source/keyword config.
- Default command `ai-catchup` works out-of-the-box using repo config (HN + Reddit + Smol + X best-effort).
- Optional overrides via flags (`--sources`, `--no-cache`, `--limit`, `--max-age-hours`, `--min-score/points`, `--search`).
- Polished TUI with rich navigation, metadata, and shortcuts.

## Architecture Changes

1. Config-driven sources

- Add `config/sources.config.json`; load at startup; fallback to minimal baked-in defaults if missing.
- Source objects specify type (`hackernews`, `reddit`, `x`, `rss`), thresholds, keywords, limits, handles/subs.
- Global settings: cache TTL, global limit, per-source cap, dedup, hard-block keywords.

2. Source adapters

- `HackerNewsSource`: Algolia API; filters by minPoints, maxAgeHours, queryTerms; story-only.
- `RedditSource`: subreddit JSON; filters by flairs, minUpvotes, maxAgeHours, limit; keywords block.
- `XSource` (best-effort): handles × mirrorBases (RSSHub/Nitter); per-handle cap; maxAgeHours; allow/block keywords; short timeouts; optional engagement filters if available.
- `RSSSource`: generic feed (smol.ai), uses keywords block.

3. Aggregation/ranking

- Build sources from config; enforce per-source cap; dedup on title+domain+link hash.
- Score = recency boost + log(points/upvotes) + keyword bonus; sort by score; respect global limit.
- Cache TTL from config; `--no-cache` bypass.

4. CLI flags

- Keep `ai-catchup` default behavior (uses config defaults).
- Add: `--sources`, `--no-cache`, `--max-age-hours`, `--min-score/points`, `--search`.

5. TUI enhancements

- Dev-themed list rows: source tag, points/upvotes/comments, domain, age, tags.
- Detail view: full content, metadata, link.
- Shortcuts: ↑/↓/Enter, ESC/q back, `r` refresh, `/` search/filter, `s` cycle sources, `o` open link, `b` bookmark toggle, `B` view bookmarks, `g/G` jump, `?` help.
- Header shows active filters/limits (e.g., “HN≥75 • ≤48h • tooling keywords”).

## Defaults

- Global: cache.ttl 30m; global.limit 20; perSourceCap 6; dedup on; hardBlock: funding, earnings, acquisition, hiring, job, press, podcast, politics, giveaway, meme.
- HN: enabled; minPoints 75; maxAgeHours 48; limit 6; queryTerms ["Claude code","OpenCode","Agents","context engineering","vector db","RAG","MCP"]; keywordsBlock ["funding","earnings","acquisition","hiring","job","press","podcast","survey","op-ed","politics"].
- Reddit: enabled; subs [ClaudeAI, LocalLLaMA, MachineLearning, OpenAI, LangChain, ArtificialInteligence, ChatGPT, Cursor, SideProject, LearnMachineLearning]; allowedFlairs ["Research","Project","Release","Show","Discussion","Tutorial","Guide"]; minUpvotes 75; maxAgeHours 72; limit 6; keywordsBlock ["hiring","funding","press","survey","giveaway","meme","politics","drama","AMA"].
- X: enabled; handles (provided list); mirrorBases [rsshub, nitter]; limitPerHandle 1; overall limit 8; maxAgeHours 36; keywordsAllow ["LLM","inference","agents","retrieval","vector","RAG","tokenizer","quantization","compiler","IDE","benchmark","eval","tooling","context window","MCP","OpenCode","Claude","Anthropic","Groq","Devin","Cursor"]; keywordsBlock ["funding","hiring","press","podcast","Spaces","giveaway","contest","politics","celebrity"].
- RSS (smol): enabled; feedUrl https://news.smol.ai/feed.xml; limit 6; inherits hardBlock.

## Verification Loop

- Test plan file `tests/manual/TEST_PLAN.md` with cases:
  1. HN fetch/filter: `ai-catchup --sources hn --limit 10`
  2. Reddit fetch/filter: `ai-catchup --sources reddit --limit 10`
  3. X fetch (best-effort): `ai-catchup --sources x --limit 8`
  4. Combined & dedup: `ai-catchup --sources hn,reddit,x --limit 20`
  5. Cache on/off: compare default vs `--no-cache`
  6. UI navigation: list→article, refresh (`r`), search (`/`), open (`o`), bookmarks (`b/B`), help (`?`)
  7. Overrides: `--max-age-hours 12`, `--min-score 100`
  8. Error handling: simulate unreachable mirror; app still renders partial results.
- Per-run results under `tests/manual/runs/YYYY-MM-DD/*.md` capturing command, timestamp, counts, sample metadata, notes/errors, mirror used (for X).
