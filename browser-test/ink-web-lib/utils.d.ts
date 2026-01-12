import React$1 from 'react';

type LoadingPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'none';
interface LoadingConfig {
    type: LoadingType;
    position?: LoadingPosition;
}
type LoadingOption = LoadingType | LoadingConfig | React$1.ReactNode;
interface InkTerminalLoadingPlaceholderProps {
    /** Number of rows to display. Should match the rows prop of InkTerminalBox. */
    rows?: number;
    /** Loading indicator configuration */
    loading?: LoadingOption;
    className?: string;
}
/**
 * SSR-safe loading placeholder for InkTerminalBox.
 * Use this as the loading fallback with Next.js dynamic imports to prevent
 * animation resets during hydration.
 */
declare const InkTerminalLoadingPlaceholder: React$1.FC<InkTerminalLoadingPlaceholderProps>;

declare const TERMINAL_LINE_HEIGHT = 18;
declare const TERMINAL_PADDING = 20;
declare const TERMINAL_BACKGROUND = "#000000";
declare const DEFAULT_ROWS = 15;
/**
 * Calculate pixel height from number of rows
 */
declare function getTerminalHeight(rows: number): number;
/**
 * Get loading placeholder style for a terminal
 */
declare function getTerminalPlaceholderStyle(rows?: number): {
    height: number;
    background: string;
};
/**
 * Get loading placeholder style with centered content
 */
declare function getTerminalPlaceholderStyleCentered(rows?: number): React.CSSProperties;

export { DEFAULT_ROWS, InkTerminalLoadingPlaceholder, type InkTerminalLoadingPlaceholderProps, type LoadingConfig, type LoadingOption, type LoadingPosition, type LoadingType, TERMINAL_BACKGROUND, TERMINAL_LINE_HEIGHT, TERMINAL_PADDING, getTerminalHeight, getTerminalPlaceholderStyle, getTerminalPlaceholderStyleCentered };
