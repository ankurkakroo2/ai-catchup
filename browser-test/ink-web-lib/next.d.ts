import React, { ReactNode, ComponentType } from 'react';
import { ITerminalOptions } from 'xterm';

type LoadingPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'none';
interface LoadingConfig {
    type: LoadingType;
    position?: LoadingPosition;
}
type LoadingOption = LoadingType | LoadingConfig | React.ReactNode;

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

interface InkModule {
    InkTerminalBox: typeof InkTerminalBox;
    [key: string]: any;
}
interface InkWebDynamicProps {
    children: ReactNode | ((ink: InkModule) => ReactNode);
    focus?: boolean;
    termOptions?: InkTerminalBoxProps['termOptions'];
}
declare const InkWebDynamic: React.ComponentType<InkWebDynamicProps>;

interface InkTerminalBoxDynamicOptions {
    /** Number of rows for the terminal. Used for skeleton height. */
    rows?: number;
    /** Loading indicator: 'spinner' | 'skeleton' | 'progress' | { type, position } | ReactNode */
    loading?: LoadingOption;
    /** Additional className for the skeleton */
    className?: string;
}
/**
 * Creates a dynamically loaded terminal component with SSR-safe skeleton.
 * The skeleton persists through hydration to prevent animation resets.
 *
 * @example
 * ```tsx
 * // MyTerminal.tsx
 * export function MyTerminal({ onReady }: { onReady?: () => void }) {
 *   return (
 *     <InkTerminalBox rows={15} onReady={onReady}>
 *       <MyApp />
 *     </InkTerminalBox>
 *   )
 * }
 *
 * // page.tsx
 * import { createDynamicTerminal } from 'ink-web'
 *
 * const Terminal = createDynamicTerminal(
 *   () => import('./MyTerminal').then(m => m.MyTerminal),
 *   { rows: 15 }
 * )
 *
 * export default function Page() {
 *   return <Terminal />
 * }
 * ```
 */
declare function createDynamicTerminal<P extends {
    onReady?: () => void;
}>(importFn: () => Promise<ComponentType<P>>, options?: InkTerminalBoxDynamicOptions): React.FC<Omit<P, 'onReady'>>;

export { type InkTerminalBoxDynamicOptions, InkWebDynamic, type InkWebDynamicProps, type LoadingConfig, type LoadingOption, type LoadingPosition, type LoadingType, createDynamicTerminal };
