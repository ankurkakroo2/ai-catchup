import { createSource } from '../sources/index.js';
import { CacheService } from './cache.js';
import { ConfigService, GlobalConfig, SourceConfig } from './config.js';
import { NewsItem } from '../sources/base.js';

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function hashKey(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function computeScore(item: NewsItem): number {
  const ageHours = Math.max(0, (Date.now() - new Date(item.pubDate).getTime()) / 3600000);
  const recency = Math.max(0, 72 - ageHours) / 72; // 0-1
  const engagement = Math.log1p(item.points || item.upvotes || item.comments || 0);
  const bonus = (item.tags || []).some(t =>
    ['agent', 'agents', 'retrieval', 'vector', 'llm', 'tooling'].includes(t)
  )
    ? 0.5
    : 0;
  return recency * 2 + engagement + bonus;
}

function extractDomain(link: string): string {
  try {
    const u = new URL(link);
    return u.hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

function dedupItems(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];
  for (const item of items) {
    const key = `${hashKey(item.title || '')}|${extractDomain(item.link || '')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export interface FetchNewsOptions {
  useCache?: boolean;
  limit?: number;
  sources?: string[];
  maxAgeHours?: number;
  minScore?: number;
  search?: string;
}

export class NewsAggregator {
  private config: ConfigService;
  private cache: CacheService<NewsItem[]>;
  private global: GlobalConfig;
  private hardBlock: string[];

  constructor() {
    this.config = new ConfigService();
    this.cache = new CacheService({ ttl: this.config.get('cache.ttl') });
    this.global = this.config.getGlobal();
    this.hardBlock = this.config.getHardBlockKeywords();
  }

  async fetchNews(options: FetchNewsOptions = {}): Promise<NewsItem[]> {
    const {
      useCache = true,
      limit = this.global.limit || 20,
      sources,
      maxAgeHours,
      minScore,
      search,
    } = options;

    const sourceConfigs = this.getSourceConfigs(sources);
    const cacheKey = `news-${(sources || []).join(',') || 'all'}-${limit}-${maxAgeHours || 'any'}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return this.applyPostFilters(cached, { limit, minScore, search });
    }

    const promises = sourceConfigs.map(cfg => this.fetchFromSourceConfig(cfg, maxAgeHours));
    const results = await Promise.all(promises);
    const merged = dedupItems(results.flat());

    if (useCache && merged.length > 0) {
      await this.cache.set(cacheKey, merged);
    }

    return this.applyPostFilters(merged, { limit, minScore, search });
  }

  private getSourceConfigs(selected?: string[]): SourceConfig[] {
    const enabled = this.config.getEnabledSourceConfigs();
    if (!selected || selected.length === 0) return enabled;
    const selectedSet = new Set(selected);
    return enabled.filter(cfg => selectedSet.has(cfg.name) || selectedSet.has(cfg.type));
  }

  private async fetchFromSourceConfig(
    cfg: SourceConfig,
    maxAgeHoursOverride?: number
  ): Promise<NewsItem[]> {
    try {
      const instance = createSource(cfg);
      if (!instance.isConfigured()) return [];
      const items = await instance.fetchNews();
      const capped = cfg.limit && cfg.limit > 0 ? items.slice(0, cfg.limit) : items;
      return capped
        .filter(item => this.passesHardBlock(item))
        .filter(item => this.passesMaxAge(item, maxAgeHoursOverride))
        .map(item => ({ ...item, score: computeScore(item) }));
    } catch (error: any) {
      console.error(`Error fetching from ${cfg.name || cfg.type}:`, error.message);
      return [];
    }
  }

  private passesHardBlock(item: NewsItem): boolean {
    const text =
      `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();
    return !this.hardBlock.some(word => text.includes(word.toLowerCase()));
  }

  private passesMaxAge(item: NewsItem, override?: number): boolean {
    if (!override) return true;
    const ageHours = Math.max(0, (Date.now() - new Date(item.pubDate).getTime()) / 3600000);
    return ageHours <= override;
  }

  private applyPostFilters(
    items: NewsItem[],
    { limit, minScore, search }: Pick<FetchNewsOptions, 'limit' | 'minScore' | 'search'>
  ): NewsItem[] {
    let filtered = items;
    if (minScore) {
      filtered = filtered.filter(item => (item.score || 0) >= minScore);
    }
    if (search) {
      const terms = toArray(search)
        .flatMap(s => s.split(','))
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      filtered = filtered.filter(item => {
        const text =
          `${item.title || ''} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
        return terms.some(term => text.includes(term));
      });
    }

    filtered = filtered
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit || filtered.length);

    return filtered;
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}
