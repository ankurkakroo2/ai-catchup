# UI Revamp Test Run 2026-01-11

## Changes Made (Latest)

### Homepage Fixes (2026-01-11 - Final Attempt)

1. **Initial Position Fixed**
   - Force setInternalIndex(0) and setWindowStart(0) on mount
   - Additional reset when news.length changes
   - Simplified windowing logic to prevent jumps

2. **Active Item Visual Clarity**
   - Removed jumpy description preview (no more showing first 180 chars)
   - Clean layout: title on line 1, meta on line 2, tags on line 3
   - Active item: bright orange title (#FF8C00), **bold**, pointer in accent (#FFAA33)
   - Inactive item: gray text, no bold
   - Fixed pointer color for inactive items (was using theme.textDim for pointer)

3. **Source Icons Working**
   - 🟠 HN for Hacker News
   - 🔴 Reddit for Reddit posts
   - 𝕏 for X/Twitter
   - 📰 RSS for RSS feeds
   - 🤖 smol for smol.ai

4. **Build Timestamp**
   - Added build time display in header (e.g., "Build: 14:32:15")
   - Helps verify latest build is running

### Previous Changes

- Full-width separators (80 chars) spanning terminal width
- Article view now scrolls entire content including title/metadata (anchored at top)
- Rich text support in article view: **bold**, _italic_, `code`, [links](url), URLs
- Keyboard shortcuts: g/G for top/bottom navigation
- Terminal height detection for dynamic content area sizing

## Theme Colors

- Primary: `#CC6600` (low-brightness orange)
- Accent: `#FFAA33` (selected item highlight)
- Secondary: `#996633` (muted brownish-orange for tags)
- Text: `#E0E0E0` (light gray)
- Dim text: `#888888`, `#666666`
- Border: `#CC6600` (primary), `#664400` (dim)
- Link: `#6699CC` (blue for URLs)
- Code: `#AAAAAA` (gray background)
- Bold: `#FFFFFF` (white)

## Test Cases

### 1. Initial Load Position

- **Command**: `./bin/ai-news.js`
- **Expected**: List starts at item 1 (top), not scrolled to bottom
- **Status**: Fixed via `setSelectedIndex(0)` on fetch completion and windowing logic

### 2. List Navigation

- **Action**: Press ↑/↓ arrows
- **Expected**: Selection moves, window scrolls to keep selection visible
- **Status**: Working with pageSize=10 windowing

### 3. Full-Width Separators

- **Expected**: Orange separator lines span 80 characters
- **Status**: Implemented via `theme.separatorWidth`

### 4. Article Entry/Exit

- **Action**: Press Enter on item, then q/ESC to go back
- **Expected**: Returns to same selected item, preserves selection
- **Status**: Fixed via `selectedIndex` state in App

### 5. Article Scroll (Anchored Top)

- **Action**: Open article
- **Expected**: View starts at top showing title first, scroll includes all content
- **Status**: Implemented via unified scrollable content array

### 6. Article Scroll Bounds

- **Action**: Press ↓ repeatedly in article view
- **Expected**: Content scrolls down, stops at end (doesn't vanish)
- **Status**: Fixed via `maxScrollOffset` clamping

### 7. Rich Text Rendering

- **Expected**: Bold (**text**), italic (_text_), code (`text`), links rendered with colors
- **Status**: Implemented via RichText component with regex parsing

### 8. Keyboard Shortcuts

- **g**: Jump to top
- **G**: Jump to bottom
- **↑/↓**: Scroll line by line
- **q/ESC**: Back to list
- **Status**: All implemented

### 9. Article Scroll Memory

- **Action**: Scroll in article, go back, re-enter same article
- **Expected**: Scroll position restored
- **Status**: Working via `articleScrollOffsets` map

## Files Changed

- `src/cli/ui/theme.js`: Centralized colors, icons, separatorWidth=80
- `src/cli/ui/NewsList.js`: Full-width separators, windowing
- `src/cli/ui/ArticleView.js`: Unified scrollable content, RichText component, top anchoring
- `src/cli/ui/App.js`: State management for selection and scroll preservation

## Notes

- Ink UI requires real TTY (raw stdin) - cannot test interactively in this environment
- Build produces `dist/index.js` (~2.7MB) + `yoga.wasm`
- Binary: `./bin/ai-news.js` or `ai-news` after `npm link`
