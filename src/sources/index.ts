import { SmolSource } from './smol.js';
import { HackerNewsSource } from './hackernews.js';
import { RedditSource } from './reddit.js';
import { XSource } from './x.js';
import { RSSSource } from './rss.js';
import { BaseSource } from './base.js';
import { SourceConfig } from '../services/config.js';

export function createSource(config: SourceConfig): BaseSource {
  const type = config.type || config.name;
  switch (type) {
    case 'smol':
      return new SmolSource(config);
    case 'rss':
      return new RSSSource({ ...config, name: config.name || 'RSS' });
    case 'hackernews':
    case 'hn':
      return new HackerNewsSource(config);
    case 'reddit':
      return new RedditSource(config);
    case 'x':
      return new XSource(config);
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}

export function getAvailableSources(): string[] {
  return ['smol', 'rss', 'hackernews', 'hn', 'reddit', 'x'];
}

export { BaseSource } from './base.js';
export type { NewsItem } from './base.js';
