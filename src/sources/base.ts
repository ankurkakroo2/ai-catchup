export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  source: string;
  tags: string[];
  content?: string;
  points?: number;
  upvotes?: number;
  comments?: number;
  domain?: string;
  score?: number;
}

export abstract class BaseSource {
  protected name: string;
  protected config: Record<string, any>;
  protected enabled: boolean;

  constructor(name: string, config: Record<string, any> = {}) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
  }

  abstract fetchNews(): Promise<NewsItem[]>;

  isConfigured(): boolean {
    return this.enabled;
  }

  getInfo(): { name: string; enabled: boolean } {
    return {
      name: this.name,
      enabled: this.enabled,
    };
  }
}
