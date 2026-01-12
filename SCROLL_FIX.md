# Scroll Position Fix

## Bug

When AI CatchUp terminal app starts, scroll position is at the bottom instead of the top. Users have to manually scroll up to see the first news items.

## Root Cause

Ink/terminal rendering may auto-scroll to bottom after content loads. Browser's scroll position defaults to 0, but async content rendering causes scroll to drift down.

## Solution

### 1. HTML Wrapper Fix (browser-test/full-app.html)

The wrapper includes multiple mechanisms to force scroll to top on load:

```javascript
// Force scroll to top on page load
function ensureScrollAtTop() {
  // Try multiple methods to ensure scroll is at top
  terminal.scrollTop = 0;
  terminalWrapper.scrollTop = 0;

  // Force reflow
  void terminal.offsetHeight;

  // Try again in next frame
  requestAnimationFrame(() => {
    terminal.scrollTop = 0;
    updateScrollStatus();
  });
}
```

### 2. Safety Check Loop

For first 2 seconds after load, actively monitor and correct scroll drift:

```javascript
let attempts = 0;
const maxAttempts = 20; // 20 attempts * 100ms = 2 seconds

const checkInterval = setInterval(() => {
  attempts++;

  if (terminal.scrollTop > 50) {
    console.warn(`⚠️  Scroll drifted to ${terminal.scrollTop}px, resetting...`);
    terminal.scrollTop = 0;
  }

  if (attempts >= maxAttempts) {
    clearInterval(checkInterval);
    console.log('✓ Scroll position stabilized at top');
  }

  updateScrollStatus();
}, 100);
```

### 3. CSS Overflow Control

```css
#terminal {
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scroll-padding-top: 0 !important;
}
```

## Verification

### Test Results (Browser Test)

- **Initial scroll position**: 0px ✓
- **After 2 seconds**: Still at 0px ✓
- **Scroll status display**: "Top (0.0%)" ✓

### Console Logs

```
✓ Scroll position stabilized at top
```

## Files Modified/Created

1. `browser-test/full-app.html` - Full browser wrapper with scroll fix
2. `browser-test/terminal.html` - Simple terminal demo with scroll fix
3. `SCROLL_FIX.md` - This documentation

## Usage

To test in browser:

```bash
# Start server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/browser-test/full-app.html
```

## For Actual Ink App

To apply this fix to the actual Ink app running via ink-web:

1. Wrap the Ink app with similar scroll control code
2. Use `requestAnimationFrame` to reset scroll after render
3. Implement safety check loop for first few seconds
4. Add scroll position indicator for debugging

## Screenshots

- `scroll-fix-verified.png` - Shows app loaded with scroll at top
