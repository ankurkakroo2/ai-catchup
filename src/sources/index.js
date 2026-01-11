import { SmolSource } from "./smol.js";
import { HackerNewsSource } from "./hackernews.js";
import { RedditSource } from "./reddit.js";
import { XSource } from "./x.js";
import { RSSSource } from "./rss.js";

/**
 * Factory to create sources by type
 */
export function createSource(config = {}) {
  const type = config.type || config.name;
  switch (type) {
    case "smol":
      return new SmolSource(config);
    case "rss":
      return new RSSSource({ ...config, name: config.name || "RSS" });
    case "hackernews":
    case "hn":
      return new HackerNewsSource(config);
    case "reddit":
      return new RedditSource(config);
    case "x":
      return new XSource(config);
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}

export function getAvailableSources() {
  return ["smol", "rss", "hackernews", "hn", "reddit", "x"];
}
