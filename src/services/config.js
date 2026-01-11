import fs from "fs";
import path from "path";

const defaultConfig = {
  cache: {
    ttl: 1800000,
  },
  global: {
    limit: 20,
    perSourceCap: 6,
    dedup: true,
    hardBlock: [
      "funding",
      "earnings",
      "acquisition",
      "hiring",
      "job",
      "press",
      "podcast",
      "politics",
      "giveaway",
      "meme",
    ],
  },
  sources: [
    {
      name: "smol",
      type: "rss",
      enabled: true,
      feedUrl: "https://news.smol.ai/feed.xml",
      limit: 6,
    },
  ],
};

function loadFileConfig() {
  try {
    const configPath = path.join(
      process.cwd(),
      "config",
      "sources.config.json",
    );
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function deepMerge(base, override) {
  if (!override) return base;
  const merged = { ...base, ...override };
  merged.cache = { ...(base.cache || {}), ...(override.cache || {}) };
  merged.global = { ...(base.global || {}), ...(override.global || {}) };
  merged.sources = override.sources || base.sources || [];
  return merged;
}

function getNested(obj, key) {
  if (!key) return undefined;
  return key
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
      obj,
    );
}

/**
 * Configuration service
 * Loads repo config file if present, otherwise falls back to defaults
 */
export class ConfigService {
  constructor() {
    const fileConfig = loadFileConfig();
    this.configData = deepMerge(defaultConfig, fileConfig || undefined);
  }

  /**
   * Get configuration value (dot notation supported)
   */
  get(key) {
    return getNested(this.configData, key);
  }

  /**
   * Get entire configuration
   */
  getAll() {
    return this.configData;
  }

  /**
   * Get enabled source configs
   */
  getEnabledSourceConfigs() {
    return (this.configData.sources || []).filter(
      (source) => source.enabled !== false,
    );
  }

  /**
   * Get global settings
   */
  getGlobal() {
    return this.configData.global || {};
  }

  /**
   * Hard block keywords (global)
   */
  getHardBlockKeywords() {
    return this.get("global.hardBlock") || [];
  }
}
