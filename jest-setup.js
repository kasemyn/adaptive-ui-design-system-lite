'use strict';

/**
 * Jest setup for apps using @fc/adaptive-ui: `setupFiles: ['@fc/adaptive-ui/jest-setup']`.
 *
 * Replaces react-native-safe-area-context's native provider with one that serves `initialMetrics` (or zero insets)
 * straight from context. Self-contained on purpose: the library's own mock ships as untranspiled TypeScript in 4.x,
 * which would force apps to add it to `transformIgnorePatterns`.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const actual = jest.requireActual('react-native-safe-area-context');

  const defaultMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  function SafeAreaProvider({ children, initialMetrics }) {
    const metrics = initialMetrics ?? defaultMetrics;
    return React.createElement(
      actual.SafeAreaFrameContext.Provider,
      { value: metrics.frame },
      React.createElement(
        actual.SafeAreaInsetsContext.Provider,
        { value: metrics.insets },
        children,
      ),
    );
  }

  return {
    ...actual,
    initialWindowMetrics: defaultMetrics,
    SafeAreaProvider,
    useSafeAreaInsets: () =>
      React.useContext(actual.SafeAreaInsetsContext) ?? defaultMetrics.insets,
    useSafeAreaFrame: () =>
      React.useContext(actual.SafeAreaFrameContext) ?? defaultMetrics.frame,
  };
});
