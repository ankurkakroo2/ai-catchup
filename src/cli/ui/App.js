import React, { useState, useEffect } from 'react';
import { Box, useApp, useInput } from 'ink';
import { NewsList } from './NewsList.js';
import { ArticleView } from './ArticleView.js';
import { NewsAggregator } from '../../services/aggregator.js';

/**
 * Main application component
 * Manages state and navigation between views
 */
export function App({ limit = 20, sourceFilter = null, keywords = null }) {
  const { exit } = useApp();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'article'
  const [selectedArticle, setSelectedArticle] = useState(null);

  const aggregator = new NewsAggregator();

  // Handle quit
  useInput((input, key) => {
    if (input === 'q' || input === 'Q') {
      if (currentView === 'list') {
        exit();
      }
    }
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  // Fetch news on mount
  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true);
        setError(null);
        let items = await aggregator.fetchNews({ limit: 100 });

        if (sourceFilter) {
          items = items.filter(item =>
            item.source.toLowerCase().includes(sourceFilter.toLowerCase())
          );
        }

        if (keywords) {
          items = aggregator.filterByKeywords(items, keywords);
        }

        items = items.slice(0, limit);
        setNews(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadNews();
  }, [limit, sourceFilter, keywords]);

  // Handle article selection
  const handleSelectArticle = article => {
    setSelectedArticle(article);
    setCurrentView('article');
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedArticle(null);
  };

  return (
    <Box flexDirection="column" padding={1}>
      {currentView === 'list' ? (
        <NewsList
          news={news}
          onSelectArticle={handleSelectArticle}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <ArticleView article={selectedArticle} onBack={handleBackToList} />
      )}
    </Box>
  );
}
