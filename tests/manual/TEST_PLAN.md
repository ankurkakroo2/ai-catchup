# Manual Test Plan

## Cases

1. **HN fetch/filter**: `ai-catchup --sources hn --limit 10`
   - Expect ≥1 item, all points ≥75, age ≤48h, matches allowlist terms.
2. **Reddit fetch/filter**: `ai-catchup --sources reddit --limit 10`
   - Expect ≥1 item, subs in allow list, flairs allowed, upvotes ≥75, age ≤72h.
3. **X fetch (best-effort)**: `ai-catchup --sources x --limit 8`
   - Up to 8 items, age ≤36h, allowlist keywords hit, block list excluded; note mirror used/unreachable.
4. **Combined & dedup**: `ai-catchup --sources hn,reddit,x --limit 20`
   - No duplicates (title+domain), per-source cap respected, sorted by score.
5. **Cache on/off**: default run vs `--no-cache` to confirm refetch (timestamps differ).
6. **UI navigation**: list navigation, open article (Enter), back (ESC/q), refresh (`r`), search/filter (`/`), open link (`o`), bookmarks (`b/B`), help (`?`).
7. **Overrides**: `--max-age-hours 12`, `--min-score 100` to confirm stricter filtering.
8. **Error handling**: simulate unreachable mirror/source; app renders partial results with notice.

## Results Recording

- Store run outputs under `tests/manual/runs/YYYY-MM-DD/CASE.md` with: command, timestamp, per-source counts, sample metadata, notes/errors, mirror used (for X).
