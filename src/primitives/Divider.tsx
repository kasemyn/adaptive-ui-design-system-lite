import { StyleSheet, View } from 'react-native';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';

type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
};

export function Divider({ orientation = 'horizontal' }: DividerProps) {
  const theme = useAdaptiveTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.colors.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  vertical: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
});
