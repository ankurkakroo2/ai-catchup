/**
 * ABOUTME: Comprehensive theme system for AI Catchup TUI.
 * Supports multiple color themes, time-based switching, emoji rendering, and border styles.
 * Inspired by popular developer tools: VS Code, Dracula, Nord, One Dark, GitHub Dark, Tokyo Night
 */

/**
 * Available theme names
 */
export type ThemeName =
  | "tokyo-night"
  | "dracula"
  | "nord"
  | "one-dark"
  | "github-dark"
  | "vscode-dark"
  | "gruvbox-dark"
  | "solarized-dark"
  | "palenight";

/**
 * Available border styles
 */
export type BorderStyle = "single" | "double" | "rounded" | "thick" | "none";

/**
 * Get current time period for theme selection
 * Returns: 'day' (6am-6pm), 'night' (6pm-6am), 'always-night'
 */
export function getTimeOfDay(): "day" | "night" | "always-night" {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

/**
 * Theme configuration interfaces
 */
interface ThemeColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    highlight: string;
  };
  fg: {
    primary: string;
    secondary: string;
    muted: string;
    dim: string;
    bright: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  source: {
    hackernews: string;
    reddit: string;
    x: string;
    smol: string;
    rss: string;
  };
  score: {
    high: string;
    medium: string;
    low: string;
  };
  border: {
    normal: string;
    active: string;
    muted: string;
  };
  accent: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

/**
 * Tokyo Night Theme (Default - Modern Japanese-inspired dark theme)
 */
const tokyoNightTheme: ThemeColors = {
  bg: {
    primary: "#1a1b26",
    secondary: "#24283b",
    tertiary: "#2f3449",
    highlight: "#3d4259",
  },
  fg: {
    primary: "#c0caf5",
    secondary: "#a9b1d6",
    muted: "#565f89",
    dim: "#414868",
    bright: "#e0e0e0",
  },
  status: {
    success: "#9ece6a",
    warning: "#e0af68",
    error: "#f7768e",
    info: "#7aa2f7",
  },
  source: {
    hackernews: "#7aa2f7",
    reddit: "#ff9e64",
    x: "#7dcfff",
    smol: "#bb9af7",
    rss: "#9ece6a",
  },
  score: {
    high: "#9ece6a",
    medium: "#e0af68",
    low: "#c0caf5",
  },
  border: {
    normal: "#3d4259",
    active: "#7aa2f7",
    muted: "#2f3449",
  },
  accent: {
    primary: "#7aa2f7",
    secondary: "#bb9af7",
    tertiary: "#7dcfff",
  },
};

/**
 * Dracula Theme - Popular dark theme with vibrant accents
 */
const draculaTheme: ThemeColors = {
  bg: {
    primary: "#282a36",
    secondary: "#44475a",
    tertiary: "#44475a",
    highlight: "#6272a4",
  },
  fg: {
    primary: "#f8f8f2",
    secondary: "#bd93f9",
    muted: "#6272a4",
    dim: "#50fa7b",
    bright: "#ffb86c",
  },
  status: {
    success: "#50fa7b",
    warning: "#ffb86c",
    error: "#ff5555",
    info: "#8be9fd",
  },
  source: {
    hackernews: "#8be9fd",
    reddit: "#ff79c6",
    x: "#ff79c6",
    smol: "#50fa7b",
    rss: "#ff79c6",
  },
  score: {
    high: "#50fa7b",
    medium: "#ffb86c",
    low: "#bd93f9",
  },
  border: {
    normal: "#6272a4",
    active: "#8be9fd",
    muted: "#44475a",
  },
  accent: {
    primary: "#8be9fd",
    secondary: "#50fa7b",
    tertiary: "#ff79c6",
  },
};

/**
 * Nord Theme - Arctic, bluish dark theme
 */
const nordTheme: ThemeColors = {
  bg: {
    primary: "#2e3440",
    secondary: "#3b4252",
    tertiary: "#434c5e",
    highlight: "#4c566a",
  },
  fg: {
    primary: "#eceff4",
    secondary: "#d8dee9",
    muted: "#4c566a",
    dim: "#81a1c1",
    bright: "#eceff4",
  },
  status: {
    success: "#a3be8c",
    warning: "#ebcb8b",
    error: "#bf616a",
    info: "#88c0d0",
  },
  source: {
    hackernews: "#88c0d0",
    reddit: "#d08770",
    x: "#8fbcbb",
    smol: "#a3be8c",
    rss: "#a3be8c",
  },
  score: {
    high: "#a3be8c",
    medium: "#ebcb8b",
    low: "#d8dee9",
  },
  border: {
    normal: "#4c566a",
    active: "#88c0d0",
    muted: "#3b4252",
  },
  accent: {
    primary: "#88c0d0",
    secondary: "#8fbcbb",
    tertiary: "#81a1c1",
  },
};

/**
 * One Dark Theme - Dark theme with warm tones
 */
const oneDarkTheme: ThemeColors = {
  bg: {
    primary: "#282c34",
    secondary: "#353b48",
    tertiary: "#3d4352",
    highlight: "#4d4b5e",
  },
  fg: {
    primary: "#c5c8c6",
    secondary: "#9da5b2",
    muted: "#5d4d4b",
    dim: "#404b57",
    bright: "#e5e5e5",
  },
  status: {
    success: "#a5d6a7",
    warning: "#d4bb7a",
    emoji: "#ff9d9d1",
    info: "#7da5b2",
  },
  source: {
    hackernews: "#7da5b2",
    reddit: "#ff9d91",
    x: "#ff9d91",
    smol: "#a5d6a7",
    rss: "#a5d6a7",
  },
  score: {
    high: "#a5d6a7",
    medium: "#d4bb7a",
    low: "#9da5b2",
  },
  border: {
    normal: "#5d4d4b",
    active: "#7da5b2",
    muted: "#353b48",
  },
  accent: {
    primary: "#7da5b2",
    secondary: "#ff9d91",
    tertiary: "#d4bb7a",
  },
};

/**
 * GitHub Dark Theme - GitHub's popular dark mode
 */
const githubDarkTheme: ThemeColors = {
  bg: {
    primary: "#0d1117",
    secondary: "#161b22",
    tertiary: "#21262d",
    highlight: "#30363d",
  },
  fg: {
    primary: "#c9d1d9",
    secondary: "#8b949e",
    muted: "#484f54",
    dim: "#30363d",
    bright: "#c9d1d9",
  },
  status: {
    success: "#2ea043",
    warning: "#d29922",
    error: "#f85149",
    info: "#58a6ff",
  },
  source: {
    hackernews: "#58a6ff",
    reddit: "#ff7b72",
    x: "#58a6ff",
    smol: "#2ea043",
    rss: "#2ea043",
  },
  score: {
    high: "#2ea043",
    medium: "#d29922",
    low: "#8b949e",
  },
  border: {
    normal: "#30363d",
    active: "#58a6ff",
    muted: "#21262d",
  },
  accent: {
    primary: "#58a6ff",
    secondary: "#ff7b72",
    tertiary: "#2ea043",
  },
};

/**
 * VS Code Dark Default Theme
 */
const vscodeDarkTheme: ThemeColors = {
  bg: {
    primary: "#1e1e1e",
    secondary: "#252526",
    tertiary: "#2d2d2d",
    highlight: "#37373d",
  },
  fg: {
    primary: "#d4d4d4",
    secondary: "#c8c8c8",
    muted: "#6a9955",
    dim: "#505050",
    bright: "#e5e5e5",
  },
  status: {
    success: "#6a9955",
    warning: "#d7ba7d",
    error: "#f14c4c",
    info: "#569cd6",
  },
  source: {
    hackernews: "#4fc1ff",
    reddit: "#ce9178",
    x: "#4fc1ff",
    smol: "#6a9955",
    rss: "#4ec9b0",
  },
  score: {
    high: "#6a9955",
    medium: "#d7ba7d",
    low: "#c8c8c8",
  },
  border: {
    normal: "#3c3c3c",
    active: "#569cd6",
    muted: "#252526",
  },
  accent: {
    primary: "#569cd6",
    secondary: "#c586c0",
    tertiary: "#4ec9b0",
  },
};

/**
 * Gruvbox Dark Theme - Soft, retro feel
 */
const gruvboxDarkTheme: ThemeColors = {
  bg: {
    primary: "#282828",
    secondary: "#3c383c",
    tertiary: "#504945",
    highlight: "#665c54",
  },
  fg: {
    primary: "#ebdbb2",
    secondary: "#d5c4a1",
    muted: "#83a598",
    dim: "#667c78",
    bright: "#fbf1c7",
  },
  status: {
    success: "#98971a",
    warning: "#fabd2f",
    error: "#fb4934",
    info: "#83a598",
  },
  source: {
    hackernews: "#fabd2f",
    reddit: "#fe8019",
    x: "#fe8019",
    smol: "#98971a",
    rss: "#98971a",
  },
  score: {
    high: "#98971a",
    theme: "#fabd2f",
    low: "#d5c4a1",
  },
  border: {
    normal: "#665c54",
    active: "#fb4934",
    muted: "#3c383c",
  },
  accent: {
    primary: "#fb4934",
    secondary: "#fe8019",
    tertiary: "#b8bb26",
  },
};

/**
 * Solarized Dark Theme - Eye-friendly
 */
const solarizedDarkTheme: ThemeColors = {
  bg: {
    primary: "#002b36",
    secondary: "#073642",
    tertiary: "#586e75",
    highlight: "#657b83",
  },
  fg: {
    primary: "#839496",
    secondary: "#93a1a1",
    muted: "#2aa198",
    dim: "#586e75",
    bright: "#ddd6f5",
  },
  status: {
    success: "#859900",
    warning: "#b58900",
    error: "#dc322f",
    info: "#268bd2",
  },
  source: {
    hackernews: "#268bd2",
    reddit: "#b58900",
    x: "#268bd2",
    smol: "#859900",
    rss: "#859900",
  },
  score: {
    high: "#859900",
    medium: "#b58900",
    low: "#93a1a1",
  },
  border: {
    normal: "#586e75",
    active: "#859900",
    muted: "#073642",
  },
  accent: {
    primary: "#859900",
    secondary: "#dc322f",
    tertiary: "#b58900",
  },
};

/**
 * Palenight Theme - Elegant purple-tinted dark theme
 */
const palenightTheme: ThemeColors = {
  bg: {
    primary: "#292d3e",
    secondary: "#44475a",
    tertiary: "#5c4b5e",
    highlight: "#818078",
  },
  fg: {
    primary: "#e0e0e0",
    secondary: "#ff79c6",
    muted: "#6c6c78",
    dim: "#5a6c78",
    bright: "#ffffff",
  },
  status: {
    success: "#50fa7b",
    warning: "#ffaf00",
    error: "#ff6b00",
    info: "#7aa2f7",
  },
  source: {
    hackernews: "#7aa2f7",
    reddit: "#ff79c6",
    x: "#7aa2f7",
    smol: "#50fa7b",
    rss: "#7aa2f7",
  },
  score: {
    high: "#50fa7b",
    medium: "#ffaf00",
    low: "#ff79c6",
  },
  border: {
    normal: "#5c4b5e",
    active: "#7aa2f7",
    muted: "#44475a",
  },
  accent: {
    primary: "#7aa2f7",
    secondary: "#ff79c6",
    tertiary: "#50fa7b",
  },
};

/**
 * Theme registry mapping
 */
const themes: Record<ThemeName, ThemeColors> = {
  "tokyo-night": tokyoNightTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  "one-dark": oneDarkTheme,
  "github-dark": githubDarkTheme,
  "vscode-dark": vscodeDarkTheme,
  "gruvbox-dark": gruvboxDarkTheme,
  "solarized-dark": solarizedDarkTheme,
  palenight: palenightTheme,
};

/**
 * Get theme based on time of day and user preference
 */
export function getTheme(
  themeName?: ThemeName,
  useTimeBased = false,
): ThemeColors {
  if (useTimeBased) {
    const timeOfDay = getTimeOfDay();
    return themes[themeName || "tokyo-night"];
  }
  return themes[themeName || "tokyo-night"];
}

/**
 * Get theme colors
 */
export let colors = getTheme();

/**
 * Update the active theme
 */
export function setTheme(themeName: ThemeName, useTimeBased = false): void {
  colors = getTheme(themeName, useTimeBased);
}

/**
 * Reset to default theme
 */
export function resetTheme(): void {
  colors = getTheme("tokyo-night");
}

/**
 * Enable/disable time-based theme switching
 * Call this with 'day' to use day theme, 'night' for night, 'always-night' to disable
 */
export function setTimeMode(mode: "day" | "night" | "always-night"): void {
  if (mode === "always-night") {
    colors = themes["tokyo-night"];
  } else {
    colors = getTheme("tokyo-night");
    // Store mode for future use
  }
}

/**
 * Available themes for user selection
 */
export const availableThemes: ThemeName[] = [
  "tokyo-night",
  "dracula",
  "nord",
  "one-dark",
  "github-dark",
  "vscode-dark",
  "gruvbox-dark",
  "solarized-dark",
  "palenight",
];

/**
 * Theme descriptions for UI display
 */
export const themeDescriptions: Record<ThemeName, string> = {
  "tokyo-night": "Tokyo Night - Modern Japanese-inspired",
  dracula: "Dracula - Popular dark theme",
  nord: "Nord - Arctic, bluish",
  "one-dark": "One Dark - Warm tones",
  "github-dark": "GitHub Dark - Official dark mode",
  "vscode-dark": "VS Code Default - Editor default",
  "gruvbox-dark": "Gruvbox - Soft retro",
  "solarized-dark": "Solarized - Eye-friendly",
  palenight: "Palenight - Elegant purple",
};

/**
 * Layout constants
 */
export const layout = {
  header: {
    height: 1,
  },
  footer: {
    height: 1,
  },
  progressDashboard: {
    height: 6,
  },
  leftPanel: {
    minWidth: 30,
    maxWidth: 50,
    defaultWidthPercent: 35,
  },
  rightPanel: {
    minWidth: 40,
  },
  padding: {
    small: 0,
    medium: 1,
    large: 2,
  },
} as const;

/**
 * Border style mappings for theme
 */
export const borderStyles: Record<BorderStyle, string> = {
  single: "single",
  double: "double",
  rounded: "rounded",
  thick: "double",
  none: "none",
} as const;

/**
 * Score thresholds for color coding
 */
export const scoreThresholds = {
  high: 4,
  medium: 2,
  low: 0,
} as const;

/**
 * Get color based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= scoreThresholds.high) return colors.score.high;
  if (score >= scoreThresholds.medium) return colors.score.medium;
  return colors.score.low;
}

/**
 * Get color based on source name
 */
export function getSourceColor(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("hn") || s.includes("hacker news"))
    return colors.source.hackernews;
  if (s.includes("reddit")) return colors.source.reddit;
  if (s.includes("x @") || s.includes("twitter")) return colors.source.x;
  if (s.includes("smol") || s.includes("smol.ai")) return colors.source.smol;
  if (s.includes("rss")) return colors.source.rss;
  return colors.source.hackernews;
}

/**
 * Get emoji for various states
 */
export const emojis = {
  loading: "⠋",
  success: "✓",
  error: "✗",
  info: "ℹ",
  warning: "⚠",
  robot: "🤖",
  news: "📰",
  time: "⏱",
  refresh: "🔄",
  star: "⭐",
  fire: "🔥",
  sparkle: "✨",
} as const;

/**
 * Get color based on status
 */
export function getStatusColor(
  status: "success" | "warning" | "error" | "info",
): string {
  return colors.status[status];
}

/**
 * Border style helpers
 */
export function getBorderStyle(style: BorderStyle = "single"): string {
  return borderStyles[style];
}

/**
 * Theme metadata for display
 */
export function getThemeInfo(themeName: ThemeName): {
  name: string;
  description: string;
} {
  return {
    name: themeName,
    description: themeDescriptions[themeName] || "Custom theme",
  };
}

/**
 * Get all available themes with descriptions
 */
export function getAllThemes(): Array<{
  name: ThemeName;
  description: string;
}> {
  return availableThemes.map((name) => ({
    name,
    description: themeDescriptions[name],
  }));
}
