'use strict';

/**
 * Warnings that point at code which breaks on foldables, tablets and resizable windows, each naming the
 * @fc/adaptive-ui replacement. Built only on ESLint's core rules, so there is no plugin to install.
 *
 * .eslintrc:    extends: ['@react-native', require.resolve('@fc/adaptive-ui/eslint')]
 * Flat config:  [...yourConfig, require('@fc/adaptive-ui/eslint')]
 *
 * These rules replace any `no-restricted-syntax` / `no-restricted-imports` settings defined earlier in your
 * config; if you already use those rules, copy these entries into your own list instead of extending.
 */

const ADAPTIVE_LAYOUT_HINT =
  "Use useAdaptiveLayout() (size classes, posture) or useAdaptiveWindowSize() from '@fc/adaptive-ui'";

module.exports = {
  rules: {
    'no-restricted-syntax': [
      'warn',
      {
        selector:
          "CallExpression[callee.object.name='Dimensions'][callee.property.name='get']",
        message: `Dimensions.get() is read once and goes stale when the device folds or the window resizes. ${ADAPTIVE_LAYOUT_HINT}.`,
      },
      {
        selector:
          "MemberExpression[object.name='Platform'][property.name='isPad']",
        message: `Platform.isPad describes the device, not the window (iPad Split View can be phone-sized). ${ADAPTIVE_LAYOUT_HINT}.`,
      },
      {
        selector: "CallExpression[callee.property.name='isTablet']",
        message: `isTablet() describes the device, not the window (a Z Fold is both). ${ADAPTIVE_LAYOUT_HINT}.`,
      },
      {
        selector:
          "ImportDeclaration[source.value='react-native'] ImportSpecifier[imported.name='Modal']",
        message:
          "Use AdaptiveModal or AdaptiveSheet from '@fc/adaptive-ui': they become dialogs and side sheets on large screens and never sit across a hinge.",
      },
      {
        selector:
          "ImportDeclaration[source.value='react-native'] ImportSpecifier[imported.name='SafeAreaView']",
        message:
          "Use Screen from '@fc/adaptive-ui': it handles safe area, keyboard and readable width, and skips edges the navigation chrome already covers.",
      },
      {
        selector: "CallExpression[callee.name='useWindowDimensions']",
        message: `useWindowDimensions() re-renders on every frame of a desktop-window drag. ${ADAPTIVE_LAYOUT_HINT}; it re-renders only when a size class changes.`,
      },
    ],
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            name: 'react-native-device-info',
            importNames: ['isTablet'],
            message: `isTablet() describes the device, not the window. ${ADAPTIVE_LAYOUT_HINT}.`,
          },
        ],
      },
    ],
  },
};
