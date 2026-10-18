import { StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';

type NavigationBadgeProps = {
  badge: string | number | undefined;
  placement?: 'overIcon' | 'inline';
};

export function NavigationBadge({
  badge,
  placement = 'overIcon',
}: NavigationBadgeProps) {
  const theme = useAdaptiveTheme();
  if (badge === undefined) {
    return null;
  }
  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: theme.spacing.xs,
          borderRadius: theme.radii.full,
          backgroundColor: theme.colors.danger,
        },
        placement === 'overIcon' && styles.overIcon,
      ]}
    >
      <Text variant="caption" color="onDanger">
        {String(badge)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overIcon: { position: 'absolute', top: 0, right: 8 },
});
