import React, { useEffect, useMemo, useState } from "react";
import { Box, useApp, useInput, Text } from "ink";
import { NewsList } from "./NewsList.js";
import { ArticleView } from "./ArticleView.js";
import { NewsAggregator } from "../../services/aggregator.js";

const isRawSupported = process.stdin.isTTY === true;

function NonInteractiveView({ news, error, isLoading }) {
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }
  if (news.length === 0) {
    return <Text>No news items found.</Text>;
  }
  return (
    <Box flexDirection="column">
      {news.map((item, i) => (
        <Box key={item.id} flexDirection="column" marginBottom={1}>
          <Text>
            {i + 1}. {item.title}
          </Text>
          <Text color="gray">
            {item.source} | {item.link}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Main application component
 * Manages state and navigation between views
 */
export function App({
  limit,
  sources,
  useCache = true,
  maxAgeHours,
  minScore,
  search,
}) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("list");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [articleScrollOffsets, setArticleScrollOffsets] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const aggregator = useMemo(() => new NewsAggregator(), []);

  const { exit } = isRawSupported ? useApp() : { exit: () => {} };

  useInput(
    (input, key) => {
      if (input === "q" || input === "Q") {
        if (currentView === "list") {
          exit();
        } else {
          setCurrentView("list");
          setSelectedArticle(null);
        }
      }
      if (key.ctrl && input === "c") {
        exit();
      }
      if (input === "r" || input === "R") {
        triggerFetch(true);
      }
    },
    { isActive: isRawSupported },
  );

  // Fetch news
  const triggerFetch = (force = false) => {
    async function loadNews() {
      try {
        setIsLoading(true);
        setError(null);
        const items = await aggregator.fetchNews({
          limit,
          sources,
          useCache: force ? false : useCache,
          maxAgeHours,
          minScore,
          search,
        });
        setNews(items);
        setLastRefreshed(new Date());
        setSelectedIndex(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  };

  useEffect(() => {
    triggerFetch(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, JSON.stringify(sources), useCache, maxAgeHours, minScore, search]);

  // Handle article selection
  const handleSelectArticle = (article, index) => {
    setSelectedArticle(article);
    setSelectedIndex(index);
    setCurrentView("article");
  };

  // Handle back to list and remember scroll
  const handleBackToList = (scrollOffset = 0) => {
    if (selectedArticle?.id) {
      setArticleScrollOffsets((prev) => ({
        ...prev,
        [selectedArticle.id]: scrollOffset,
      }));
    }
    setCurrentView("list");
    setSelectedArticle(null);
  };

  const currentScrollOffset = selectedArticle?.id
    ? articleScrollOffsets[selectedArticle.id] || 0
    : 0;

  if (!isRawSupported) {
    return (
      <Box flexDirection="column" padding={1}>
        <NonInteractiveView news={news} error={error} isLoading={isLoading} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {currentView === "list" ? (
        <NewsList
          news={news}
          onSelectArticle={handleSelectArticle}
          isLoading={isLoading}
          error={error}
          lastRefreshed={lastRefreshed}
          onRefresh={() => triggerFetch(true)}
          selectedIndex={selectedIndex}
          onChangeIndex={setSelectedIndex}
        />
      ) : (
        <ArticleView
          article={selectedArticle}
          onBack={handleBackToList}
          initialScrollOffset={currentScrollOffset}
        />
      )}
    </Box>
  );
}
