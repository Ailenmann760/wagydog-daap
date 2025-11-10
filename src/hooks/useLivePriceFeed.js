import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_BNB_PRICE = 285.5;
const DEFAULT_REFRESH_INTERVAL = 15_000;

const simulatePriceRequest = () =>
  new Promise((resolve) => {
    const latency = 450 + Math.random() * 550;
    setTimeout(() => {
      const variance = (Math.random() - 0.5) * 6;
      const price = Math.max(DEFAULT_BNB_PRICE + variance, 150);

      resolve({
        price: Number(price.toFixed(2)),
        source: 'mock-oracle',
        timestamp: new Date(),
      });
    }, latency);
  });

const useLivePriceFeed = ({ pollInterval = DEFAULT_REFRESH_INTERVAL } = {}) => {
  const mountedRef = useRef(true);
  const [status, setStatus] = useState('idle');
  const [price, setPrice] = useState(DEFAULT_BNB_PRICE);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('bootstrap');

  const fetchPrice = useCallback(async () => {
    setStatus((previous) => (previous === 'success' ? 'refreshing' : 'loading'));
    setError(null);

    try {
      const result = await simulatePriceRequest();
      if (!mountedRef.current) return;

      setPrice(result.price);
      setLastUpdated(result.timestamp);
      setSource(result.source);
      setStatus('success');
    } catch (err) {
      if (!mountedRef.current) return;
      setStatus('error');
      setError(err instanceof Error ? err : new Error('Failed to fetch price data'));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrice();

    if (pollInterval === 0) {
      return () => {
        mountedRef.current = false;
      };
    }

    const intervalId = setInterval(() => {
      fetchPrice();
    }, pollInterval);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchPrice, pollInterval]);

  const formatBnbToUsd = useCallback(
    (bnbAmount = 0) => {
      const amount = Number(bnbAmount);
      if (!Number.isFinite(amount)) return 0;
      return amount * price;
    },
    [price],
  );

  const formatUsd = useCallback(
    (usdValue = 0, { minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(Number(usdValue) || 0),
    [],
  );

  const formattedPrice = useMemo(() => formatUsd(price, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [formatUsd, price]);

  const isLoading = status === 'idle' || status === 'loading';
  const isRefreshing = status === 'refreshing';
  const isError = status === 'error';

  return {
    price,
    formattedPrice,
    lastUpdated,
    status,
    source,
    error,
    isLoading,
    isRefreshing,
    isError,
    formatBnbToUsd,
    formatUsd,
    refetch: fetchPrice,
  };
};

export default useLivePriceFeed;
