import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_REFRESH_INTERVAL = 30_000;

const simulateLiquidityQuery = () =>
  new Promise((resolve) => {
    const latency = 600 + Math.random() * 400;
    setTimeout(() => {
      const baseLockedUsd = 4_800_000;
      const variance = Math.random() * 200_000 - 100_000;
      const lockedUsd = Math.max(baseLockedUsd + variance, 3_500_000);

      resolve({
        lockedUsd: Math.round(lockedUsd),
        timestamp: new Date(),
      });
    }, latency);
  });

const useLiquidityLocked = ({ pollInterval = DEFAULT_REFRESH_INTERVAL } = {}) => {
  const mountedRef = useRef(true);
  const [status, setStatus] = useState('idle');
  const [lockedUsd, setLockedUsd] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchLockedLiquidity = useCallback(async () => {
    setStatus((previous) => (previous === 'success' ? 'refreshing' : 'loading'));
    setError(null);

    try {
      const result = await simulateLiquidityQuery();
      if (!mountedRef.current) return;

      setLockedUsd(result.lockedUsd);
      setLastUpdated(result.timestamp);
      setStatus('success');
    } catch (err) {
      if (!mountedRef.current) return;

      setStatus('error');
      setError(err instanceof Error ? err : new Error('Failed to load liquidity data'));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLockedLiquidity();

    if (pollInterval === 0) {
      return () => {
        mountedRef.current = false;
      };
    }

    const intervalId = setInterval(() => {
      fetchLockedLiquidity();
    }, pollInterval);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchLockedLiquidity, pollInterval]);

  const formattedLockedUsd = useMemo(() => {
    if (lockedUsd == null) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(lockedUsd);
  }, [lockedUsd]);

  const isLoading = status === 'idle' || status === 'loading';
  const isRefreshing = status === 'refreshing';

  return {
    lockedUsd,
    formattedLockedUsd,
    lastUpdated,
    status,
    isLoading,
    isRefreshing,
    error,
    refresh: fetchLockedLiquidity,
  };
};

export default useLiquidityLocked;
