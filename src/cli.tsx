import React from "react";
import { createRoot } from "@opentui/react";
import { createCliRenderer } from "@opentui/core";
import { Command } from "commander";
import { App } from "./components/App.js";
import {
  getAllThemes,
  availableThemes,
  ThemeName,
  setTheme,
  setTimeMode,
  getTimeOfDay,
  type ThemeName,
} from "./tui/theme.js";

const program = new Command();

program
  .name("ai-catchup")
  .description(
    "Beautiful terminal-based CLI for curated AI news from premium sources",
  )
  .version("2.0.0")
  .option("-l, --limit <number>", "Maximum number of news items to fetch")
  .option(
    "-s, --sources <list>",
    "Comma-separated list of sources to enable (e.g., hn,reddit,x)",
  )
  .option("--no-cache", "Bypass cache when fetching news")
  .option("--max-age-hours <number>", "Max age (hours) for items")
  .option("--min-score <number>", "Minimum score threshold after ranking")
  .option("--search <query>", "Search/filter string")
  .option(
    "--theme <name>",
    `Theme name: ${getAllThemes()
      .map((t) => t.name)
      .join(", ")}`,
  )
  .option(
    "--time-mode <mode>",
    "Time mode: day, night, always-night (auto based on time)",
  )
  .action(async (options) => {
    const parsed = {
      limit: options.limit ? parseInt(options.limit, 10) : undefined,
      sources: options.sources
        ? options.sources
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined,
      useCache: options.cache,
      maxAgeHours: options.maxAgeHours
        ? parseInt(options.maxAgeHours, 10)
        : undefined,
      minScore: options.minScore ? parseFloat(options.minScore) : undefined,
      search: options.search || undefined,
      theme: options.theme as ThemeName,
      timeMode: options.timeMode as "day" | "night" | "always-night",
    };

    if (parsed.theme) {
      setTheme(parsed.theme);
    }

    if (parsed.timeMode) {
      setTimeMode(parsed.timeMode);
    }

    if (!process.stdin.isTTY) {
      console.log("Note: Running in non-interactive mode");
      console.log(
        "For full interactive experience, run in a proper terminal.\n",
      );
    }

    console.log("Available themes:");
    getAllThemes().forEach((t) => {
      console.log(`  ${t.name}: ${t.description}`);
    });

    try {
      const renderer = await createCliRenderer();
      const root = createRoot(renderer);
      root.render(<App {...parsed} />);
    } catch (error: any) {
      console.error("Failed to start TUI:", error.message);
      process.exit(1);
    }
  });

program.parse();
