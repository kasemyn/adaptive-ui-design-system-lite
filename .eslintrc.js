module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['lib/'],
  overrides: [
    {
      files: ['bin/**/*.js', 'eslint.js', 'jest-setup.js', '__tests__/**/*.js'],
      env: { node: true, jest: true },
    },
  ],
};
