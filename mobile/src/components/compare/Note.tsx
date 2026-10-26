import { View } from 'react-native';
import { Icon } from '../Icon';
import { T } from '../ui';
import { useTheme } from '../../theme';

/** A short explanatory note with an info icon, like the website's Note. */
export function Note({ children, style }: { children: string; style?: { marginTop?: number } }) {
  const { colors } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, style]} accessible accessibilityLabel={children}>
      <View style={{ paddingTop: 2 }}>
        <Icon name="info" size={16} color={colors.textSecondary} />
      </View>
      <T variant="subhead" color="textSecondary" style={{ flex: 1 }}>
        {children}
      </T>
    </View>
  );
}
