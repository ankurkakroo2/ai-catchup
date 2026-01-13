# Scroll Position Bug - Test Results

## Testing Summary

### Bug Mode (No Fix)

- **100% Zoom**: Scroll at 0px (Top) ✓
- **200% Zoom**: Scroll at 0px (Top) ✓
- **300% Zoom**: Scroll at 0px (Top) ✓

### Fixed Mode (With Fix)

- **100% Zoom**: Scroll at 0px (Top) ✓
- **200% Zoom**: Scroll at 0px (Top) ✓
- **300% Zoom**: Scroll at 0px (Top) ✓

## Analysis

The simulated terminal stays at top in both bug and fix modes. This suggests:

1. **The demo doesn't reproduce the real bug** - Simple HTML rendering doesn't have the same timing issues as real Ink app

2. **Real issue is with ink-web + Ink app** - The actual AI CatchUp app (dist/index.js) when run via ink-web may have different scroll behavior

3. **Possible causes in real app:**
   - Ink's internal rendering pipeline
   - ink-web's Xterm.js integration
   - Async content fetching (network requests)
   - React reconciliation timing

## Problem with ink-web Integration

Attempting to run actual app via ink-web failed:

- Module import errors (React not found in browser)
- ES module compatibility issues
- ink-web expects certain module format

## Recommendations

### Option 1: Test in Real Terminal

```bash
# Test in actual terminal (best approach)
node dist/index.js news --limit 10
```

### Option 2: Modify Ink App to Force Scroll Top

Add to `src/cli/ui/App.js`:

```javascript
useEffect(() => {
  // Force scroll position in terminal
  process.stdout.write('\x1b[0;0H'); // Reset cursor to home

  return () => {
    // Cleanup
  };
}, []);
```

### Option 3: Create ink-web Wrapper

Create a custom wrapper that:

1. Loads the dist/index.js
2. Injects scroll-fix code before render
3. Monitors terminal output position

### Option 4: Manual Verification

For now, verify manually:

1. Open actual terminal
2. Run: `node dist/index.js news --limit 10`
3. Observe initial scroll position
4. If at bottom, the bug exists
5. Press Home key to go to top

## Test Files Created

1. `browser-test/scroll-zoom-demo.html` - Zoomable terminal demo
2. `browser-test/bug-vs-fix.html` - Side-by-side bug/fix comparison
3. `SCROLL_FIX.md` - Documentation of fix approach

## Conclusion

The HTML simulation doesn't reproduce the real scroll bug. The actual issue occurs when:

- Running via ink-web in browser
- Ink app fetches async content
- React renders multiple passes

**Next steps needed:**

1. Test in real terminal to confirm bug exists
2. If confirmed, modify Ink app components
3. Add terminal scroll control sequences
4. Test with ink-web again
