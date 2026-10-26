import { Redirect } from 'expo-router';

// The app opens at "/", which has no screen of its own: send it to the first tab.
export default function Index() {
  return <Redirect href="/when" />;
}
