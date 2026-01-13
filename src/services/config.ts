import fs from 'fs';
import path from 'path';

export interface SourceConfig {
  name: string;
  type: string;
  enabled: boolean;
  feedUrl?: string;
  subreddits?: string[];
  allowedFlairs?: string[];
  minUpvotes?: number;
  handles?: string[];
  mirrorBases?: string[];
  limit?: number;
  limitPerHandle?: number;
  overallLimit?: number;
  maxAgeHours?: number;
  keywordsAllow?: string[];
  keywordsBlock?: string[];
}

export interface CacheConfig {
  ttl: number;
}

export interface GlobalConfig {
  limit: number;
  perSourceCap: number;
  dedup: boolean;
  hardBlock: string[];
}

export interface Config {
  cache: CacheConfig;
  global: GlobalConfig;
  sources: SourceConfig[];
}

const defaultConfig: Config = {
  cache: {
    ttl: 1800000,
  },
  global: {
    limit: 20,
    perSourceCap: 6,
    dedup: true,
    hardBlock: [
      'funding',
      'earnings',
      'acquisition',
      'hiring',
      'job',
      'press',
      'podcast',
      'politics',
      'giveaway',
      'meme',
    ],
  },
  sources: [
    {
      name: 'smol',
      type: 'rss',
      enabled: true,
      feedUrl: 'https://news.smol.ai/feed.xml',
      limit: 6,
    },
  ],
};

function loadFileConfig(): Partial<Config> | null {
  try {
    const configPath = path.join(process.cwd(), 'config', 'sources.config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as Partial<Config>;
  } catch (error) {
    return null;
  }
}

function deepMerge<T extends Record<string, any>>(base: T, override: Partial<T> | undefined): T {
  if (!override) return base;
  const merged = { ...base, ...override };
  if (base.cache && override.cache) {
    merged.cache = { ...(base.cache as any), ...(override.cache as any) };
  }
  if (base.global && override.global) {
    merged.global = { ...(base.global as any), ...(override.global as any) };
  }
  merged.sources = override.sources || base.sources || [];
  return merged;
}

function getNested(obj: any, key: string): any {
  if (!key) return undefined;
  return key
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export class ConfigService {
  private configData: Config;

  constructor() {
    const fileConfig = loadFileConfig();
    this.configData = deepMerge(defaultConfig, fileConfig || undefined);
  }

  get(key: string): any {
    return getNested(this.configData, key);
  }

  getAll(): Config {
    return this.configData;
  }

  getEnabledSourceConfigs(): SourceConfig[] {
    return (this.configData.sources || []).filter(source => source.enabled !== false);
  }

  getGlobal(): GlobalConfig {
    return this.configData.global || {};
  }

  getHardBlockKeywords(): string[] {
    return this.get('global.hardBlock') || [];
  }
}
