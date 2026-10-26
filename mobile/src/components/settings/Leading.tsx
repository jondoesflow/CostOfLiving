import { View } from 'react-native';
import { isIOS, useTheme } from '../../theme';
import { Icon, type IconName } from '../Icon';

/** The icon before a navigation row: an iOS Settings-style tinted square, or a plain Material icon. */
export function Leading({ name }: { name: IconName }) {
  const { colors } = useTheme();
  return isIOS ? (
    <View style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={17} color={colors.onTint} />
    </View>
  ) : (
    <Icon name={name} size={24} color={colors.textSecondary} />
  );
}
