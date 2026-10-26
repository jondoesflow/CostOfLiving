import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface RequestState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** True while a pull-to-refresh is running (data stays on screen). */
  refreshing: boolean;
  reload: () => void;
  refresh: () => void;
}

/**
 * Runs `fn` when `deps` change (or immediately if `auto`), tracking loading/error state.
 * Stale responses from an earlier call are ignored.
 */
export function useRequest<T>(fn: () => Promise<T>, deps: unknown[], { auto = true }: { auto?: boolean } = {}): RequestState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(auto);
  const [refreshing, setRefreshing] = useState(false);
  const callId = useRef(0);
  const fnRef = useRef(fn);
  // Always call the latest fn without making it an effect dependency.
  useLayoutEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback((mode: 'load' | 'refresh') => {
    const id = ++callId.current;
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    fnRef
      .current()
      .then((result) => {
        if (id === callId.current) setData(result);
      })
      .catch((err: unknown) => {
        if (id === callId.current) setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      })
      .finally(() => {
        if (id === callId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      });
  }, []);

  useEffect(() => {
    // Refetching when inputs change has to flip `loading` on straight away, so the screen shows
    // the new request is in flight rather than stale results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (auto) run('load');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    error,
    loading,
    refreshing,
    reload: useCallback(() => run('load'), [run]),
    refresh: useCallback(() => run('refresh'), [run]),
  };
}
