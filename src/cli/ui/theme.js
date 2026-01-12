// Theme colors: High contrast, low brightness orange
export const theme = {
  primary: '#CC6600', // Low-brightness orange
  primaryBright: '#FF8C00', // Slightly brighter orange for highlights
  secondary: '#996633', // Muted brownish-orange
  accent: '#FFAA33', // Accent for selected items
  text: '#E0E0E0', // Light gray text
  textDim: '#888888', // Dim text
  textMuted: '#666666', // Very dim text
  border: '#CC6600', // Orange border
  borderDim: '#664400', // Dim orange border
  error: '#CC3333', // Red for errors
  success: '#33AA33', // Green for success
  link: '#6699CC', // Blue for links
  code: '#AAAAAA', // Gray for code
  bold: '#FFFFFF', // White for bold
  separator: '─', // Separator character
  separatorWidth: 80, // Full width separator
};

export const icons = {
  pointer: '▸',
  pointerEmpty: ' ',
  bullet: '•',
  arrow: '→',
  check: '✓',
  cross: '✗',
  star: '★',
  scrollUp: '▲',
  scrollDown: '▼',
};

// Source icons/logos
export const sourceIcons = {
  hackernews: 'Y', // HN orange logo
  hn: 'Y', // HN short form
  reddit: 'r/', // Reddit
  x: 'X', // X (Twitter)
  twitter: 'X', // X short form
  rss: 'RSS', // RSS
  smol: '🤖', // Robot for smol.ai
};

// Simple rich text parser for content
export function parseRichText(text) {
  if (!text) return [];

  // For simplicity, just return text with basic formatting hints
  // The actual rendering will handle styles
  return text;
}
