import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { formatDistanceToNow } from 'date-fns';

/**
 * News list component with keyboard navigation
 */
export function NewsList({ news, onSelectArticle, isLoading, error }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(news.length - 1, prev + 1));
    } else if (key.return) {
      if (news[selectedIndex]) {
        onSelectArticle(news[selectedIndex]);
      }
    }
  });

  // Reset selection when news changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [news]);

  if (isLoading) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>{' '}
            <Text>Fetching latest AI news...</Text>
          </Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text color="red">✗ Error: {error}</Text>
        </Box>
        <Text dimColor>Press Ctrl+C to exit</Text>
      </Box>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text color="yellow">No news items found</Text>
        <Text dimColor>Try refreshing or check your internet connection</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={0} marginBottom={1}>
        <Text bold color="cyan">
          AI CatchUp - Latest AI News ({news.length} items)
        </Text>
      </Box>

      {/* News items */}
      <Box flexDirection="column" paddingX={1}>
        {news.map((item, index) => (
          <NewsItem key={item.id} item={item} isSelected={index === selectedIndex} index={index} />
        ))}
      </Box>

      {/* Footer */}
      <Box marginTop={1} paddingX={2} paddingY={1} borderStyle="round" borderColor="gray">
        <Text dimColor>↑↓ Navigate • Enter to read • Q to quit</Text>
      </Box>
    </Box>
  );
}

/**
 * Individual news item component
 */
function NewsItem({ item, isSelected, index }) {
  const timeAgo = formatDistanceToNow(new Date(item.pubDate), {
    addSuffix: true,
  });

  const pointer = isSelected ? '▶ ' : '  ';

  return (
    <Box flexDirection="column" paddingX={1} paddingY={0} marginBottom={1}>
      <Box>
        <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
          {pointer}
          {index + 1}. {item.title}
        </Text>
      </Box>

      <Box paddingLeft={3}>
        <Text dimColor>
          {item.source} • {timeAgo}
          {item.tags.length > 0 && ` • ${item.tags.slice(0, 3).join(' ')}`}
        </Text>
      </Box>

      {isSelected && item.description && (
        <Box paddingLeft={3} marginTop={0}>
          <Text color="gray">
            {item.description.slice(0, 150)}
            {item.description.length > 150 ? '...' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}
