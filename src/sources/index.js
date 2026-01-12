import { SmolSource } from "./smol.js";
import { XSource } from "./x.js";
import { RSSSource } from "./rss.js";
import { HackerNewsSource } from "./hackernews.js";
import { RedditSource } from "./reddit.js";

/**
 * Available news sources
 * Add new sources here as they are implemented
 */
export const sources = {
  smol: SmolSource,
  x: XSource,
  rss: RSSSource,
  hackernews: HackerNewsSource,
  reddit: RedditSource,
};

/**
 * Get all available source names
 * @returns {Array<string>}
 */
export function getAvailableSources() {
  return Object.keys(sources);
}

/**
 * Create a source instance
 * @param {string} name - Source name
 * @param {Object} config - Source configuration
 * @returns {BaseSource}
 */
export function createSource(name, config = {}) {
  const SourceClass = sources[name];
  if (!SourceClass) {
    throw new Error(`Unknown source: ${name}`);
  }
  return new SourceClass(config);
}
