const { ESLint } = require('eslint');
const adaptiveUiEslintPreset = require('../eslint');

async function lintSource(source) {
  const eslint = new ESLint({
    useEslintrc: false,
    overrideConfig: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      ...adaptiveUiEslintPreset,
    },
  });
  const [result] = await eslint.lintText(source);
  return result.messages.map(message => message.message);
}

describe('@fc/adaptive-ui/eslint', () => {
  it('flags module-scope Dimensions.get with the replacement', async () => {
    const messages = await lintSource(
      "import { Dimensions } from 'react-native';\nconst { width } = Dimensions.get('window');",
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('useAdaptiveLayout()');
  });

  it('flags device checks and the imports that have adaptive replacements', async () => {
    const messages = await lintSource(
      [
        "import { Modal, Platform, SafeAreaView, useWindowDimensions } from 'react-native';",
        "import DeviceInfo from 'react-native-device-info';",
        'const isBigScreen = Platform.isPad || DeviceInfo.isTablet();',
        'const size = useWindowDimensions();',
      ].join('\n'),
    );
    expect(messages).toHaveLength(5);
    expect(messages.join('\n')).toContain('AdaptiveModal');
    expect(messages.join('\n')).toContain('Screen');
  });

  it('stays quiet on adaptive code', async () => {
    const messages = await lintSource(
      "import { useAdaptiveLayout } from '@fc/adaptive-ui';\nconst { isAtLeast } = useAdaptiveLayout();",
    );
    expect(messages).toEqual([]);
  });
});
