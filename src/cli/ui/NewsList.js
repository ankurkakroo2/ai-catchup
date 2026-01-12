import React, { useEffect, useState } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import Spinner from "ink-spinner";
import { formatDistanceToNow, format } from "date-fns";
import { theme, icons, sourceIcons } from "./theme.js";

// Build timestamp for debugging
const BUILD_TIME = format(new Date(), "HH:mm:ss");

function getSourceIcon(source) {
  if (!source) return source;
  const lower = source.toLowerCase();

  // Check for partial matches (e.g., "Reddit /r/ClaudeAI" -> "reddit")
  if (lower.startsWith("hacker news")) return sourceIcons["hackernews"];
  if (lower.startsWith("reddit")) return sourceIcons["reddit"];
  if (lower.startsWith("x ")) return sourceIcons["x"];
  if (lower === "rss" || lower === "smol") return sourceIcons[lower];

  // Direct match
  return sourceIcons[lower] || source;
}

function metaLine(item, timeAgo) {
  const parts = [];
  if (item.source) parts.push(getSourceIcon(item.source));
  if (item.domain) parts.push(item.domain);
  if (item.points !== undefined) parts.push(`${item.points} pts`);
  if (item.upvotes !== undefined) parts.push(`${item.upvotes} up`);
  if (item.comments !== undefined) parts.push(`${item.comments}c`);
  parts.push(timeAgo);
  return parts.join(` ${icons.bullet} `);
}

function Separator({ color = theme.borderDim, width = theme.separatorWidth }) {
  return (
    <Box>
      <Text color={color}>{theme.separator.repeat(width)}</Text>
    </Box>
  );
}

/**
 * News list component with keyboard navigation
 */
export function NewsList({
  news,
  onSelectArticle,
  isLoading,
  error,
  lastRefreshed,
  onRefresh,
  selectedIndex = 0,
  onChangeIndex,
}) {
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80;
  const separatorWidth = Math.max(40, terminalWidth - 4); // Account for padding

  // Always start at position 0 on first render
  const [internalIndex, setInternalIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const pageSize = 10;

  // Force reset to top whenever news is loaded fresh
  useEffect(() => {
    setInternalIndex(0);
    setWindowStart(0);
  }, []); // Run once on mount

  // Also reset when news changes
  useEffect(() => {
    if (news && news.length > 0) {
      setInternalIndex(0);
      setWindowStart(0);
    }
  }, [news?.length]); // Only when news array length changes

  // Handle keyboard input
  useInput((input, key) => {
    if (key.upArrow) {
      setInternalIndex((prev) => {
        const next = Math.max(0, prev - 1);
        onChangeIndex?.(next);
        return next;
      });
    } else if (key.downArrow) {
      setInternalIndex((prev) => {
        const next = Math.min(news.length - 1, prev + 1);
        onChangeIndex?.(next);
        return next;
      });
    } else if (key.return) {
      const item = news[internalIndex];
      if (item) {
        onSelectArticle(item, internalIndex);
      }
    } else if ((input === "r" || input === "R") && onRefresh) {
      onRefresh();
    }
  });

  // Simple windowing: if selection goes out of window, scroll to it
  useEffect(() => {
    if (internalIndex < windowStart) {
      setWindowStart(internalIndex);
    } else if (internalIndex >= windowStart + pageSize) {
      setWindowStart(Math.max(0, internalIndex - pageSize + 1));
    }
  }, [internalIndex, windowStart, pageSize]);

  const maxStart = Math.max(0, news.length - pageSize);
  const safeWindowStart = Math.min(windowStart, maxStart);
  const windowEnd = Math.min(safeWindowStart + pageSize, news.length);
  const windowItems = news.slice(safeWindowStart, windowEnd);

  if (isLoading) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text>
            <Text color={theme.primary}>
              <Spinner type="dots" />
            </Text>{" "}
            <Text color={theme.text}>Fetching latest AI news...</Text>
          </Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text color={theme.error}>
            {icons.cross} Error: {error}
          </Text>
        </Box>
        <Text color={theme.textDim}>Press Ctrl+C to exit</Text>
      </Box>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text color={theme.primary}>No news items found</Text>
        <Text color={theme.textDim}>
          Try refreshing or check your internet connection
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={2}
        paddingY={0}
        marginBottom={1}
        justifyContent="space-between"
      >
        <Box>
          <Text bold color={theme.primary}>
            AI News
          </Text>
          <Text color={theme.textDim}> {icons.bullet} </Text>
          <Text color={theme.text}>{news.length} items</Text>
          {lastRefreshed && (
            <>
              <Text color={theme.textDim}> {icons.bullet} </Text>
              <Text color={theme.textDim}>
                {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
              </Text>
            </>
          )}
          {safeWindowStart > 0 && (
            <Text color={theme.textMuted}> {icons.scrollUp}</Text>
          )}
          {windowEnd < news.length && (
            <Text color={theme.textMuted}> {icons.scrollDown}</Text>
          )}
        </Box>
        <Text color={theme.textMuted}>Build: {BUILD_TIME}</Text>
      </Box>

      {/* News items */}
      <Box flexDirection="column" paddingX={1}>
        {windowItems.map((item, offsetIndex) => {
          const actualIndex = safeWindowStart + offsetIndex;
          return (
            <React.Fragment key={item.id}>
              <NewsItem
                item={item}
                isSelected={actualIndex === internalIndex}
                index={actualIndex}
              />
              {offsetIndex < windowItems.length - 1 && (
                <Separator width={separatorWidth} />
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        marginTop={1}
        paddingX={2}
        paddingY={0}
        borderStyle="single"
        borderColor={theme.borderDim}
      >
        <Text color={theme.textDim}>
          <Text color={theme.primary}>↑↓</Text> Navigate{" "}
          <Text color={theme.textMuted}>{icons.bullet}</Text>{" "}
          <Text color={theme.primary}>Enter</Text> Read{" "}
          <Text color={theme.textMuted}>{icons.bullet}</Text>{" "}
          <Text color={theme.primary}>r</Text> Refresh{" "}
          <Text color={theme.textMuted}>{icons.bullet}</Text>{" "}
          <Text color={theme.primary}>q</Text> Quit
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Individual news item component - clean layout without jumpy description
 */
function NewsItem({ item, isSelected, index }) {
  const timeAgo = formatDistanceToNow(new Date(item.pubDate), {
    addSuffix: true,
  });

  const pointer = isSelected ? icons.pointer : icons.pointerEmpty;
  const tags = (item.tags || []).slice(0, 3).join(" ");

  // Active item: bright orange, bold
  // Inactive item: gray, no bold
  const titleColor = isSelected ? theme.primaryBright : theme.text;
  const metaColor = isSelected ? theme.textDim : theme.textMuted;
  const pointerColor = isSelected ? theme.accent : theme.textMuted;
  const indexColor = isSelected ? theme.primary : theme.textMuted;

  return (
    <Box flexDirection="column" paddingX={1} paddingY={0}>
      <Box>
        <Text color={pointerColor}>{pointer}</Text>
        <Text color={indexColor} bold={isSelected}>
          {String(index + 1).padStart(2, " ")}.
        </Text>
        <Text color={titleColor} bold={isSelected}>
          {" "}
          {item.title}
        </Text>
      </Box>

      <Box paddingLeft={3}>
        <Text color={metaColor}>{metaLine(item, timeAgo)}</Text>
      </Box>

      {tags && (
        <Box paddingLeft={3}>
          <Text color={theme.secondary}>{tags}</Text>
        </Box>
      )}
    </Box>
  );
}
