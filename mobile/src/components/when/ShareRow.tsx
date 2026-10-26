import { Share, View } from 'react-native';
import { shareMessage } from '../../lib/when/view';
import { Button } from '../ui';

/** "Share this": the phone's share sheet with the result and a link back to the site. */
export function ShareRow({ text }: { text: string }) {
  async function share() {
    try {
      await Share.share({ message: shareMessage(text) });
    } catch {
      // They closed the sheet, or sharing isn't available; nothing to do.
    }
  }
  return (
    <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
      <Button title="Share this" variant="tonal" icon="share" onPress={share} accessibilityHint="Opens the share sheet" />
    </View>
  );
}
