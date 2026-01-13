import React from "react";
import type { ReactNode } from "react";
import { colors, layout, emojis } from "../tui/theme.js";

export function Header({ title }: { title: string }): ReactNode {
  return (
    <box
      style={{
        width: "100%",
        height: layout.header.height,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <text fg={colors.fg.primary}>{title}</text>
    </box>
  );
}

export function Footer({ actions }: { actions: string }): ReactNode {
  return (
    <box
      style={{
        width: "100%",
        height: layout.footer.height,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: colors.bg.secondary,
        borderTop: true,
        borderTopColor: colors.border.muted,
      }}
    >
      <text fg={colors.fg.muted}>{actions}</text>
    </box>
  );
}

export function LoadingSpinner(): ReactNode {
  return <text fg={colors.status.warning}>{emojis.loading} Loading...</text>;
}

export function ErrorMessage({ error }: { error: string }): ReactNode {
  return (
    <box
      style={{
        padding: layout.padding.medium,
        backgroundColor: colors.bg.highlight,
        border: true,
        borderColor: colors.status.error,
      }}
    >
      <text fg={colors.status.error}>
        {emojis.error} Error: {error}
      </text>
    </box>
  );
}

export function EmptyState({ message }: { message: string }): ReactNode {
  return (
    <box
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: layout.padding.large,
        paddingBottom: layout.padding.large,
      }}
    >
      <text fg={colors.fg.muted}>{message}</text>
    </box>
  );
}
