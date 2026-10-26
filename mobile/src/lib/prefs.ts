import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// Small, local-only preferences. Nothing is sent anywhere; there are no accounts.
const PREFIX = 'cheapwatts:';

export async function getPref<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function setPref<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Preferences are a convenience; failing to save must never break the app.
  }
}

/** useState that is restored from, and saved to, local storage. `loaded` is false until restored. */
export function usePref<T>(key: string, fallback: T): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    getPref(key, fallback).then((v) => {
      if (alive) {
        setValue(v);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (v: T) => {
      setValue(v);
      setPref(key, v);
    },
    [key],
  );
  return [value, update, loaded];
}
