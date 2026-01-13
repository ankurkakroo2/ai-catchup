import React, { useState } from "react";
import type { ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { NewsItem } from "../sources/base.js";
import { formatDistanceToNow } from "date-fns";
import { colors, layout, getSourceColor, emojis } from "../tui/theme.js";

interface ArticleViewProps {
  article: NewsItem | null;
  onBack: (scrollOffset?: number) => void;
  initialScrollOffset?: number;
}

export function ArticleView({
  article,
  onBack,
  initialScrollOffset = 0,
}: ArticleViewProps): ReactNode {
  const [scrollOffset, setScrollOffset] = useState(initialScrollOffset);
  const [showHelp, setShowHelp] = useState(false);
  const maxScroll = Math.max(0, (article?.content?.length || 0) - 20);

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

    if (e.name === "q" || e.name === "escape") {
      onBack(scrollOffset);
      return;
    }

    if (e.name === "up" || e.name === "k") {
      setScrollOffset((prev) => Math.max(0, prev - 5));
    } else if (e.name === "down" || e.name === "j") {
      setScrollOffset((prev) => Math.min(maxScroll, prev + 5));
    } else if (e.name === "g") {
      setScrollOffset(0);
    } else if (e.name === "G") {
      setScrollOffset(maxScroll);
    }
  });

  if (!article) {
    return (
      <box style={{ flexDirection: "column", padding: layout.padding.medium }}>
        <text fg={colors.status.error}>{emojis.error} No article selected</text>
      </box>
    );
  }

  if (showHelp) {
    return <HelpOverlay onClose={() => setShowHelp(false)} />;
  }

  const contentLines = (article.content || article.description || "").split(
    "\n",
  );
  const visibleLines = contentLines.slice(scrollOffset, scrollOffset + 20);

  return (
    <box style={{ flexDirection: "column", flexGrow: 1, overflowY: "auto" }}>
      <box
        style={{
          border: true,
          borderColor: colors.accent.primary,
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
            {article.title}
          </text>
        </box>

        <box
          style={{
            flexDirection: "column",
            paddingLeft: layout.padding.medium,
          }}
        >
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={getSourceColor(article.source)} bold>
              {article.source}
            </text>
            <text fg={colors.fg.muted}>| </text>
            <text fg={colors.fg.secondary}>
              {formatDistanceToNow(new Date(article.pubDate), {
                addSuffix: true,
              })}
            </text>
            {article.score !== undefined && (
              <text fg={colors.status.success}>
                • Score: {article.score.toFixed(1)}
              </text>
            )}
          </box>

          <box style={{ marginTop: 0 }}>
            <text fg={colors.accent.tertiary}>
              {emojis.link} {article.link}
            </text>
          </box>

          {article.tags && article.tags.length > 0 && (
            <box style={{ marginTop: 0 }}>
              <text fg={colors.accent.secondary}>
                {emojis.star} Tags: {article.tags.join(", ")}
              </text>
            </box>
          )}
        </box>
      </box>

      <box
        style={{
          border: true,
          borderColor: colors.accent.tertiary,
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <box
          style={{
            flexDirection: "column",
            paddingLeft: layout.padding.medium,
            paddingRight: layout.padding.medium,
          }}
        >
          {visibleLines.map((line, i) => (
            <box key={i}>
              <text fg={colors.fg.primary}>{line || " "}</text>
            </box>
          ))}
          {scrollOffset + 20 < contentLines.length && (
            <box>
              <text fg={colors.fg.muted}>
                ↓ {contentLines.length - scrollOffset - 20} more lines
              </text>
            </box>
          )}
        </box>
      </box>

      <box
        style={{
          border: true,
          borderColor: colors.border.muted,
          marginTop: layout.padding.small,
        }}
      >
        <box
          style={{
            paddingLeft: layout.padding.medium,
            paddingRight: layout.padding.medium,
          }}
        >
          <text fg={colors.fg.muted}>
            {emojis.updown}/j/k Scroll | {emojis.top}/{emojis.bottom} Top/Bottom
            | {emojis.quit}/{emojis.escape} Back | {emojis.help} Help
          </text>
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
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <text fg={colors.accent.tertiary}>
            {scrollOffset > 0 ? emjis.up : " "}{" "}
          </text>
          <text fg={colors.fg.secondary}>
            Line {scrollOffset} of {Math.max(0, contentLines.length - 20)}
          </text>
          <text fg={colors.accent.tertiary}>
            {" "}
            {scrollOffset < maxScroll ? emjis.down : " "}
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
            Article View - Keyboard Shortcuts
          </text>
        </box>

        <box style={{ flexDirection: "column", gap: 0 }}>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.updown}/j/k</text>
            <text fg={colors.fg.secondary}>Scroll up/down</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.top}</text>
            <text fg={colors.fg.secondary}>Go to top</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.bottom}</text>
            <text fg={colors.fg.secondary}>Go to bottom</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>
              {emojis.quit}/{emojis.escape}
            </text>
            <text fg={colors.fg.secondary}>Back to list</text>
          </box>
          <box style={{ flexDirection: "row", gap: 2 }}>
            <text fg={colors.accent.tertiary}>{emojis.help}</text>
            <text fg={colors.fg.secondary}>Show help</text>
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
