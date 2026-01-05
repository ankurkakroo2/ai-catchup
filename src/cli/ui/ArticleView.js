import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { formatDistanceToNow } from 'date-fns';

/**
 * Article detail view component
 * Shows full article content with scrolling
 */
export function ArticleView({ article, onBack }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const maxVisibleLines = 20; // Adjust based on terminal height

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      onBack();
    } else if (key.upArrow) {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setScrollOffset((prev) => prev + 1);
    } else if (input === 'q' || input === 'Q') {
      onBack();
    }
  });

  if (!article) {
    return (
      <Box paddingX={2} paddingY={1}>
        <Text color="red">No article selected</Text>
      </Box>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.pubDate), {
    addSuffix: true,
  });

  // Split content into lines for scrolling
  const contentLines = article.content.split('\n');
  const visibleContent = contentLines
    .slice(scrollOffset, scrollOffset + maxVisibleLines)
    .join('\n');

  const hasMoreContent = scrollOffset + maxVisibleLines < contentLines.length;
  const canScrollUp = scrollOffset > 0;

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={0}
        marginBottom={1}
      >
        <Text bold color="cyan">
          {article.title}
        </Text>
      </Box>

      {/* Metadata */}
      <Box paddingX={2} marginBottom={1} flexDirection="column">
        <Text dimColor>
          Source: {article.source} • Published {timeAgo}
        </Text>
        {article.tags.length > 0 && (
          <Text dimColor>Tags: {article.tags.join(', ')}</Text>
        )}
        <Text color="blue" underline>
          {article.link}
        </Text>
      </Box>

      {/* Content */}
      <Box
        borderStyle="round"
        borderColor="gray"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
        marginBottom={1}
      >
        <Text>{visibleContent}</Text>

        {hasMoreContent && (
          <Box marginTop={1}>
            <Text dimColor italic>
              ... (more content below, scroll with ↓)
            </Text>
          </Box>
        )}

        {canScrollUp && scrollOffset > 0 && (
          <Box marginTop={1}>
            <Text dimColor italic>
              (scroll up with ↑ to see previous content)
            </Text>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        paddingX={2}
        paddingY={1}
        borderStyle="round"
        borderColor="gray"
      >
        <Text dimColor>
          ↑↓ Scroll • ESC or Q to go back • Ctrl+C to quit
        </Text>
      </Box>
    </Box>
  );
}
