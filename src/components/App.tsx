import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { NewsAggregator } from "../services/aggregator.js";
import { NewsItem } from "../sources/base.js";
import { NewsList } from "./NewsList.js";
import { ArticleView } from "./ArticleView.js";
import { Header, Footer } from "./UI.js";
import {
  colors,
  layout,
  emojis,
  getSourceColor,
  getScoreColor,
  getStatusColor,
} from "../tui/theme.js";

interface AppProps {
  limit?: number;
  sources?: string[];
  useCache?: boolean;
  maxAgeHours?: number;
  minScore?: number;
  search?: string;
}

export function App({
  limit,
  sources,
  useCache = true,
  maxAgeHours,
  minScore,
  search,
}: AppProps): ReactNode {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "article">("list");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [articleScrollOffsets, setArticleScrollOffsets] = useState<
    Record<string, number>
  >({});
  const aggregator = useMemo(() => new NewsAggregator(), []);

  useKeyboard((e) => {
    if (e.name === "q" || e.name === "escape") {
      if (currentView === "list") {
        process.exit(0);
      }
    }
  });

  const triggerFetch = useCallback(
    (force = false) => {
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
          setSelectedIndex(0);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      loadNews();
    },
    [aggregator, limit, sources, useCache, maxAgeHours, minScore, search],
  );

  useEffect(() => {
    triggerFetch(false);
  }, [triggerFetch]);

  const handleSelectArticle = useCallback(
    (article: NewsItem, index: number) => {
      setSelectedArticle(article);
      setSelectedIndex(index);
      setCurrentView("article");
    },
    [],
  );

  const handleBackToList = useCallback(
    (scrollOffset: number = 0) => {
      if (selectedArticle?.id) {
        setArticleScrollOffsets((prev) => ({
          ...prev,
          [selectedArticle.id]: scrollOffset,
        }));
      }
      setCurrentView("list");
      setSelectedArticle(null);
    },
    [selectedArticle?.id],
  );

  const currentScrollOffset = selectedArticle?.id
    ? articleScrollOffsets[selectedArticle.id] || 0
    : 0;

  return (
    <box
      style={{
        flexDirection: "column",
        backgroundColor: colors.bg.primary,
        width: "100%",
        height: "100%",
      }}
    >
      <Header title={`${emojis.robot} AI Catchup v2.0`} />

      <box
        style={{
          flexDirection: "column",
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {currentView === "list" ? (
          <NewsList
            news={news}
            onSelectArticle={handleSelectArticle}
            isLoading={isLoading}
            error={error}
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
      </box>

      <Footer
        actions={`${emojis.help}? Help | ${emojis.quit} Quit | ${emojis.refresh} Refresh | ${emojis.updown} Navigate`}
      />
    </box>
  );
}
