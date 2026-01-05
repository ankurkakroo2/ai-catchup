#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './cli/ui/App.js';

const program = new Command();

program
  .name('ai-catchup')
  .description('Terminal-based CLI for curated AI news from premium sources')
  .version('1.0.0')
  .option('-l, --limit <number>', 'Maximum number of news items to fetch', '20')
  .action((options) => {
    const limit = parseInt(options.limit, 10);
    render(<App limit={limit} />);
  });

program.parse();
