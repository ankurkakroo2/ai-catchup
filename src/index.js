#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './cli/ui/App.js';
import { NewsAggregator } from './services/aggregator.js';
import { ConfigService } from './services/config.js';

const program = new Command();

program
  .name('ai-catchup')
  .description('Terminal-based CLI for curated AI news from premium sources')
  .version('1.0.0');

program
  .command('news')
  .description('Fetch and display latest AI news (default command)')
  .option('-l, --limit <number>', 'Maximum number of news items to fetch', '20')
  .option('-s, --source <name>', 'Fetch from specific source only')
  .option('-f, --filter <keywords>', 'Filter by keywords (comma-separated)')
  .action(async options => {
    const limit = parseInt(options.limit, 10);
    const sourceFilter = options.source;
    const keywords = options.filter;
    render(<App limit={limit} sourceFilter={sourceFilter} keywords={keywords} />);
  });

program
  .command('search <query>')
  .description('Search news items')
  .option('-l, --limit <number>', 'Maximum number of results', '20')
  .action(async (query, options) => {
    const aggregator = new NewsAggregator();
    try {
      const results = await aggregator.search(query);
      console.log(JSON.stringify(results.slice(0, parseInt(options.limit)), null, 2));
    } catch (error) {
      console.error('Search failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('config [key] [value]')
  .description('View or manage configuration')
  .option('-g, --get', 'Get a configuration value')
  .option('-s, --set', 'Set a configuration value')
  .option('--reset', 'Reset configuration to defaults')
  .action(async (key, value, options) => {
    const config = new ConfigService();

    if (options.reset) {
      config.reset();
      console.log('Configuration reset to defaults');
    } else if (options.get) {
      if (!key) {
        console.error('Usage: --get requires a key');
        process.exit(1);
      }
      const configKey = options.get === true ? key : options.get;
      const configValue = config.get(configKey);
      console.log(JSON.stringify(configValue, null, 2));
    } else if (options.set) {
      if (!key || value === undefined) {
        console.error('Usage: config set <key> <value>');
        process.exit(1);
      }
      try {
        const parsedValue = JSON.parse(value);
        config.set(key, parsedValue);
        console.log(`Set ${key} to`, parsedValue || value);
      } catch {
        config.set(key, value);
        console.log(`Set ${key} to`, value);
      }
    } else {
      if (key) {
        const configValue = config.get(key);
        console.log(JSON.stringify(configValue, null, 2));
      } else {
        console.log(JSON.stringify(config.getAll(), null, 2));
      }
    }
  });

program
  .command('clear-cache')
  .description('Clear the news cache')
  .action(async () => {
    const aggregator = new NewsAggregator();
    await aggregator.clearCache();
    console.log('Cache cleared');
  });

program.action(() => {
  render(<App limit={20} />);
});

program.parse();
