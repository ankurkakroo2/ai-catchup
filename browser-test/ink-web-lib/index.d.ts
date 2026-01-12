import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
export { Box, Instance, Newline, RenderOptions, Spacer, Static, Text, Transform, measureElement, render, useApp, useFocus, useFocusManager, useInput, useIsScreenReaderEnabled, useStderr, useStdin, useStdout } from 'ink';

declare const DemoApp: () => react_jsx_runtime.JSX.Element;

type LoadingPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'none';
interface LoadingConfig {
    type: LoadingType;
    position?: LoadingPosition;
}
type LoadingOption = LoadingType | LoadingConfig | React.ReactNode;
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
declare const InkTerminalLoadingPlaceholder: React.FC<InkTerminalLoadingPlaceholderProps>;

/**
 * Calculate pixel height from number of rows
 */
declare function getTerminalHeight(rows: number): number;

interface InkTerminalBoxProps {
    className?: string;
    focus?: boolean;
    termOptions?: ITerminalOptions;
    children: React.ReactElement;
    /** Number of rows to display. Determines terminal height. */
    rows?: number;
    /** Callback when terminal is ready and rendered */
    onReady?: () => void;
    /** Loading indicator to show while terminal initializes. Defaults to skeleton loader. Set to false to disable. */
    loading?: LoadingOption | false;
    /** Padding around the terminal content in pixels. Defaults to 10. */
    padding?: number;
}

/**
 * A wrapper component that provides proper styling and containment for InkXterm.
 * Handles CSS isolation from parent styles and ensures proper scrolling behavior.
 */
declare const InkTerminalBox: React.FC<InkTerminalBoxProps>;

interface InkXtermProps {
    className?: string;
    focus?: boolean;
    termOptions?: ITerminalOptions;
    children: React.ReactElement;
    onReady?: () => void;
}
declare const InkXterm: React.FC<InkXtermProps>;

interface InkWebOptions {
    termOptions?: ITerminalOptions;
    container: HTMLElement;
    focus?: boolean;
    onReady?: () => void;
}
declare function mountInkInXterm(element: React.ReactElement, opts: InkWebOptions): {
    term: Terminal;
    unmount: () => Promise<void>;
};

declare const waitForYogaInit: () => Promise<void>;

export { DemoApp, InkTerminalBox, InkTerminalLoadingPlaceholder, type InkTerminalLoadingPlaceholderProps, type InkWebOptions, InkXterm, type LoadingConfig, type LoadingOption, type LoadingPosition, type LoadingType, getTerminalHeight, mountInkInXterm, waitForYogaInit };
