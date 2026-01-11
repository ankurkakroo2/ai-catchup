#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import { Command } from "commander";
import { App } from "./cli/ui/App.js";

const program = new Command();

program
  .name("ai-catchup")
  .description("Terminal-based CLI for curated AI news from premium sources")
  .version("1.0.0")
  .option("-l, --limit <number>", "Maximum number of news items to fetch")
  .option(
    "-s, --sources <list>",
    "Comma-separated list of sources to enable (e.g., hn,reddit,x)",
  )
  .option("--no-cache", "Bypass cache when fetching news")
  .option("--max-age-hours <number>", "Max age (hours) for items")
  .option("--min-score <number>", "Minimum score threshold after ranking")
  .option("--search <query>", "Search/filter string")
  .action((options) => {
    const parsed = {
      limit: options.limit ? parseInt(options.limit, 10) : undefined,
      sources: options.sources
        ? options.sources
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      useCache: options.cache,
      maxAgeHours: options.maxAgeHours
        ? parseInt(options.maxAgeHours, 10)
        : undefined,
      minScore: options.minScore ? parseFloat(options.minScore) : undefined,
      search: options.search || undefined,
    };

    if (!process.stdin.isTTY) {
      console.log("Note: Running in non-interactive mode");
      console.log(
        "For full interactive experience, run in a proper terminal.\n",
      );
    }

    render(<App {...parsed} />, {
      stdin: process.stdin,
      stdout: process.stdout,
    });
  });

program.parse();
