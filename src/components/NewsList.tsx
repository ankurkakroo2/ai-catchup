import React from "react";
import { useKeyboard } from "@opentui/react";
import { NewsItem } from "../sources/base.js";
import { formatDistanceToNow } from "date-fns";
import {
  colors,
  layout,
  getScoreColor,
  getSourceColor,
  emojis,
  getStatusColor,
} from "../tui/theme.js";

interface NewsListProps {
  news: NewsItem[];
  onSelectArticle: (article: NewsItem, index: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
}

export function NewsList({
  news,
  onSelectArticle,
  isLoading,
  error,
  onRefresh,
  selectedIndex,
  onChangeIndex,
}: NewsListProps): ReactNode {
  const [showHelp, setShowHelp] = React.useState(false);

  useKeyboard((e) => {
    if (showHelp) {
      if (e.name === "q" || e.name === "escape") {
        setShowHelp(false);
      }
      return;
    }

    if (e.name === "?") {
      setShowHelp(true);
      return;
    }

    if (e.name === "r") {
      onRefresh();
      return;
    }

    if (e.name === "up") {
      onChangeIndex(Math.max(0, selectedIndex - 1));
    } else if (e.name === "down") {
      onChangeIndex(Math.min(news.length - 1, selectedIndex + 1));
    } else if (e.name === "return" || e.name === " " || e.name === "o") {
      if (news[selectedIndex]) {
        onSelectArticle(news[selectedIndex], selectedIndex);
      }
    }
  });

  if (showHelp) {
    return <HelpOverlay onClose={() => setShowHelp(false)} />;
  }

  if (isLoading) {
    return (
      <box style={{ padding: layout.padding.medium }}>
        <text fg={colors.status.warning}>
          {emojis.loading} Fetching latest AI news...
        </text>
      </box>
    );
  }

  if (error) {
    return (
      <box style={{ flexDirection: "column", padding: layout.padding.medium }}>
        <text fg={colors.status.error}>
          {emojis.error} Error: {error}
        </text>
        <text fg={colors.fg.muted}>Press 'r' to retry or 'q' to quit</text>
      </box>
    );
  }

  if (news.length === 0) {
    return (
      <box
        style={{
          flexDirection: "column",
          padding: layout.padding.medium,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <text fg={colors.fg.muted}>{emojis.info} No news items found</text>
        <text fg={colors.fg.muted}>Press 'r' to refresh</text>
      </box>
    );
  }

  return (
    <box style={{ flexDirection: "column", flexGrow: 1, overflowY: "auto" }}>
      <box
        style={{
          border: true,
          borderColor: colors.border.normal,
          marginBottom: layout.padding.small,
        }}
      >
        <box
          style={{
            backgroundColor: colors.accent.primary,
            paddingLeft: layout.padding.medium,
            paddingRight: layout.padding.medium,
          }}
        >
          <text fg={colors.bg.primary} bold>
            {emojis.news} AI News Feed
          </text>
          <text fg={colors.bg.primary}> - {news.length} items</text>
        </box>

        <box
          style={{
            flexDirection: "column",
            paddingLeft: layout.padding.medium,
          }}
        >
          {news.map((item, index) => (
            <box
              key={item.id}
              style={{
                flexDirection: "column",
                paddingTop:
                  index === 0 ? layout.padding.medium : layout.padding.small,
                paddingBottom:
                  index < news.length - 1
                    ? layout.padding.medium
                    : layout.padding.small,
                backgroundColor:
                  index === selectedIndex ? colors.bg.tertiary : undefined,
              }}
            >
              <box style={{ flexDirection: "row", gap: 0 }}>
                <text fg={getScoreColor(item.score || 0)}>{index + 1}.</text>
                <text fg={getSourceColor(item.source)}>[{item.source}]</text>
                <text
                  fg={
                    index === selectedIndex
                      ? colors.fg.primary
                      : colors.fg.secondary
                  }
                >
                  {" "}
                  {item.title}
                </text>
              </box>

              <box style={{ paddingLeft: 2 }}>
                <text fg={colors.fg.muted}>
                  {item.description?.slice(0, 120)}
                  {item.description && item.description.length > 120
                    ? "..."
                    : ""}
                </text>
              </box>

              <box style={{ flexDirection: "row", gap: 1, paddingLeft: 2 }}>
                <text fg={colors.fg.muted}>
                  {formatDistanceToNow(new Date(item.pubDate), {
                    addSuffix: true,
                  })}
                </text>
                {item.score !== undefined && (
                  <text fg={getScoreColor(item.score)}>
                    • Score: {item.score.toFixed(1)}
                  </text>
                )}
                {item.comments !== undefined && (
                  <text fg={colors.accent.tertiary}>
                    • {item.comments} comments
                  </text>
                )}
                {(item.tags || []).length > 0 && (
                  <text fg={colors.accent.secondary}>
                    • {item.tags.slice(0, 3).join(", ")}
                  </text>
                )}
              </box>
            </box>
          ))}
        </box>
      </box>

      <box
        style={{
          border: true,
          borderColor: colors.border.muted,
        }}
      >
        <box
          style={{
            paddingLeft: layout.padding.medium,
            paddingRight: layout.padding.medium,
          }}
        >
          <text fg={colors.fg.muted}>
            {emojis.up}↑↓ Navigate | {emojis.return}Enter/{emojis.space} Read |{" "}
            {emojis.refresh} Refresh | {emojis.help} Help | {emojis.quit} Quit
          </text>
        </box>
      </box>
    </box>
  );
}

function HelpOverlay({ onClose }: { onClose: () => void }): ReactNode {
  const [visible, setVisible] = React.useState(true);

  useKeyboard(() => {
    if (visible) {
      setVisible(false);
      setTimeout(onClose, 0);
    }
  });

  return (
    <box
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000B3",
      }}
    >
      <box
        style={{
          flexDirection: "column",
          padding: layout.padding.large,
          backgroundColor: colors.bg.secondary,
          border: true,
          borderColor: colors.accent.primary,
          minWidth: 50,
        }}
      >
        <box style={{ marginBottom: 1, justifyContent: "center" }}>
          <text fg={colors.accent.primary} bold>
            Keyboard Shortcuts
          </text>
        </box>

        <box style={{ flexDirection: "column", gap: 0 }}>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.up}↓</text>
            <text fg={colors.fg.secondary}>Navigate up/down</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>
              Enter/{emojis.space}/{emojis.read}
            </text>
            <text fg={colors.fg.secondary}>Read article</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.refresh}</text>
            <text fg={colors.fg.secondary}>Refresh news</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.help}</text>
            <text fg={colors.fg.secondary}>Show help</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>
              {emojis.quit}/{emojis.escape}
            </text>
            <text fg={colors.fg.secondary}>Quit / Back</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>ctrl+c</text>
            <text fg={colors.fg.secondary}>Force quit</text>
          </box>
        </box>

        <box style={{ marginTop: 1, justifyContent: "center" }}>
          <text fg={colors.fg.muted}>Press any key to close</text>
        </box>
      </box>
    </box>
  );
}
