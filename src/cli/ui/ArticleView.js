import React, { useEffect, useState, useMemo } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import { formatDistanceToNow } from "date-fns";
import { theme, icons } from "./theme.js";

/**
 * Parse and render rich text with basic markdown support
 */
function RichText({ children, color = theme.text }) {
  if (!children) return null;

  const text = String(children);
  const parts = [];
  let lastIndex = 0;
  let key = 0;

  // Combined regex for all patterns
  const combinedRegex =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))|(https?:\/\/[^\s]+)/g;

  let match;
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <Text key={key++} color={color}>
          {text.slice(lastIndex, match.index)}
        </Text>,
      );
    }

    if (match[1]) {
      // Bold: **text**
      parts.push(
        <Text key={key++} color={theme.bold} bold>
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      // Italic: *text*
      parts.push(
        <Text key={key++} color={color} italic>
          {match[4]}
        </Text>,
      );
    } else if (match[5]) {
      // Code: `text`
      parts.push(
        <Text key={key++} color={theme.code} backgroundColor="#333333">
          {match[6]}
        </Text>,
      );
    } else if (match[7]) {
      // Link: [text](url)
      parts.push(
        <Text key={key++} color={theme.link} underline>
          {match[8]}
        </Text>,
      );
    } else if (match[10]) {
      // URL
      parts.push(
        <Text key={key++} color={theme.link} underline>
          {match[10]}
        </Text>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <Text key={key++} color={color}>
        {text.slice(lastIndex)}
      </Text>,
    );
  }

  return parts.length > 0 ? <>{parts}</> : <Text color={color}>{text}</Text>;
}

function Separator({ color = theme.borderDim, width = theme.separatorWidth }) {
  return (
    <Box>
      <Text color={color}>{theme.separator.repeat(width)}</Text>
    </Box>
  );
}

/**
 * Article detail view component
 * Shows full article content with scrolling and rich text
 */
export function ArticleView({ article, onBack, initialScrollOffset = 0 }) {
  const { stdout } = useStdout();
  const terminalHeight = stdout?.rows || 24;

  // Calculate visible area (leave room for header, meta, footer)
  const headerLines = 6;
  const footerLines = 2;
  const maxVisibleLines = Math.max(
    5,
    terminalHeight - headerLines - footerLines,
  );

  const [scrollOffset, setScrollOffset] = useState(0);

  // Build scrollable content: header + metadata + content
  const scrollableContent = useMemo(() => {
    if (!article) return [];

    const lines = [];

    // Title section
    lines.push({ type: "title", text: article.title });
    lines.push({ type: "separator" });

    // Metadata
    const timeAgo = formatDistanceToNow(new Date(article.pubDate), {
      addSuffix: true,
    });
    lines.push({
      type: "meta",
      text: `${article.source} ${icons.bullet} ${timeAgo}`,
    });

    if (article.domain) {
      lines.push({ type: "meta", text: `Domain: ${article.domain}` });
    }
    if (article.points !== undefined) {
      lines.push({
        type: "meta",
        text: `${article.points} pts ${icons.bullet} ${article.comments || 0} comments`,
      });
    }
    if (article.upvotes !== undefined) {
      lines.push({
        type: "meta",
        text: `${article.upvotes} upvotes ${icons.bullet} ${article.comments || 0} comments`,
      });
    }
    if (article.tags && article.tags.length > 0) {
      lines.push({ type: "tags", text: article.tags.slice(0, 5).join(" ") });
    }
    lines.push({ type: "link", text: article.link });
    lines.push({ type: "separator" });

    // Content
    const contentText =
      article.content || article.description || "No content available";
    const contentLines = contentText.split("\n");
    contentLines.forEach((line) => {
      lines.push({ type: "content", text: line });
    });

    return lines;
  }, [article]);

  const totalLines = scrollableContent.length;
  const maxScrollOffset = Math.max(0, totalLines - maxVisibleLines);

  useEffect(() => {
    setScrollOffset(Math.min(initialScrollOffset, maxScrollOffset));
  }, [initialScrollOffset, article?.id, maxScrollOffset]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      onBack(scrollOffset);
    } else if (key.upArrow) {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setScrollOffset((prev) => Math.min(maxScrollOffset, prev + 1));
    } else if (key.pageDown) {
      setScrollOffset((prev) =>
        Math.min(maxScrollOffset, prev + maxVisibleLines),
      );
    } else if (key.pageUp) {
      setScrollOffset((prev) => Math.max(0, prev - maxVisibleLines));
    } else if (input === "g") {
      setScrollOffset(0);
    } else if (input === "G") {
      setScrollOffset(maxScrollOffset);
    } else if (input === "q" || input === "Q") {
      onBack(scrollOffset);
    }
  });

  if (!article) {
    return (
      <Box paddingX={2} paddingY={1}>
        <Text color={theme.error}>No article selected</Text>
      </Box>
    );
  }

  const visibleLines = scrollableContent.slice(
    scrollOffset,
    scrollOffset + maxVisibleLines,
  );
  const hasMoreBelow = scrollOffset + maxVisibleLines < totalLines;
  const hasMoreAbove = scrollOffset > 0;
  const scrollPercent =
    totalLines <= maxVisibleLines
      ? 100
      : Math.round((scrollOffset / maxScrollOffset) * 100);

  return (
    <Box flexDirection="column">
      {/* Scroll position indicator */}
      <Box paddingX={1}>
        <Text color={theme.primary} bold>
          AI News
        </Text>
        <Text color={theme.textMuted}> {icons.bullet} Article View</Text>
        {hasMoreAbove && <Text color={theme.textMuted}> {icons.scrollUp}</Text>}
        {hasMoreBelow && (
          <Text color={theme.textMuted}> {icons.scrollDown}</Text>
        )}
        <Text color={theme.textMuted}> ({scrollPercent}%)</Text>
      </Box>

      <Separator color={theme.border} />

      {/* Scrollable content */}
      <Box flexDirection="column" paddingX={1} minHeight={maxVisibleLines}>
        {visibleLines.map((line, idx) => (
          <ContentLine key={scrollOffset + idx} line={line} />
        ))}
      </Box>

      <Separator color={theme.border} />

      {/* Footer */}
      <Box paddingX={1}>
        <Text color={theme.textDim}>
          <Text color={theme.primary}>↑↓</Text> Scroll{" "}
          <Text color={theme.textMuted}>{icons.bullet}</Text>{" "}
          <Text color={theme.primary}>g/G</Text> Top/Bottom{" "}
          <Text color={theme.textMuted}>{icons.bullet}</Text>{" "}
          <Text color={theme.primary}>q/ESC</Text> Back
        </Text>
      </Box>
    </Box>
  );
}

function ContentLine({ line }) {
  switch (line.type) {
    case "title":
      return (
        <Box>
          <Text color={theme.primary} bold>
            {line.text}
          </Text>
        </Box>
      );
    case "separator":
      return <Separator color={theme.borderDim} />;
    case "meta":
      return (
        <Box>
          <Text color={theme.textDim}>{line.text}</Text>
        </Box>
      );
    case "tags":
      return (
        <Box>
          <Text color={theme.secondary}>{line.text}</Text>
        </Box>
      );
    case "link":
      return (
        <Box>
          <Text color={theme.link} underline>
            {line.text}
          </Text>
        </Box>
      );
    case "content":
    default:
      return (
        <Box>
          <RichText color={theme.text}>{line.text}</RichText>
        </Box>
      );
  }
}
