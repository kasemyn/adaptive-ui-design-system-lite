module.exports = {
  preset: '@react-native/jest-preset',
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  setupFiles: ['<rootDir>/jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|standard-navigation)/)',
  ],
};
