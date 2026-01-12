# Test Run 2026-01-11

## Command: HN

```
node --input-type=module -e "import { NewsAggregator } from './src/services/aggregator.js'; const a=new NewsAggregator(); a.fetchNews({limit:3,useCache:false,sources:['hn']}).then(r=>{ console.log('count', r.length); console.log(r.map(x=>({title:x.title?.slice(0,60), points:x.points, ageHours:((Date.now()-new Date(x.pubDate))/3600000).toFixed(1)}))); }).catch(e=>console.error(e));"
```

- Result: count 1
- Sample: Show HN: Librario... | points 120 | age ~16h
- Notes: Allowlist query returned 0, fallback query returned 1 item.

## Command: Reddit

```
node --input-type=module -e "import { NewsAggregator } from './src/services/aggregator.js'; const a=new NewsAggregator(); a.fetchNews({limit:5,useCache:false,sources:['reddit']}).then(r=>{ console.log('count', r.length); console.log(r.map(x=>({title:x.title?.slice(0,60), upvotes:x.upvotes, flair:x.tags?.find(t=>!['reddit',x.domain].includes(t)), ageHours:((Date.now()-new Date(x.pubDate))/3600000).toFixed(1)}))); }).catch(e=>console.error(e));"
```

- Result: count 5
- Samples:
  - "Visualizing RAG, PART 2..." | upvotes 202 | flair LocalLLaMA | age ~22.8h
  - "Jensen Huang at CES..." | upvotes 172 | flair LocalLLaMA | age ~29.2h
  - "Long article on the current state of Agentic AI" | upvotes 101 | flair ArtificialInteligence | age ~32.5h
  - "I made GPT-5.2/5 mini play 21,000 hands of Poker" | upvotes 196 | flair OpenAI | age ~68.1h
  - "I just saw my face on an AI generated image..." | upvotes 152 | flair ArtificialInteligence | age ~64.9h

## Command: X (best-effort)

```
node --input-type=module -e "import { NewsAggregator } from './src/services/aggregator.js'; const a=new NewsAggregator(); a.fetchNews({limit:5,useCache:false,sources:['x']}).then(r=>{ console.log('count', r.length); console.log(r.map(x=>({title:x.title?.slice(0,60), source:x.source, ageHours:((Date.now()-new Date(x.pubDate))/3600000).toFixed(1)}))); }).catch(e=>console.error(e));"
```

- Result: count 0
- Notes: No items returned. Possible mirror availability or allowlist filtering; keep best-effort note.

## Notes

- Interactive Ink UI could not be run in this environment due to stdin raw mode restriction; validation performed via direct aggregator calls.
