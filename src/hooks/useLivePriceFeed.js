import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const COIN_IDS = {
  BNB: 'binancecoin',
  WAGY_PROXY: 'ethereum',
};

const COINGECKO_PRICE_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COIN_IDS).join(',')}&vs_currencies=usd`;
const DEFAULT_PRICE_PARAMS = {
  ids: Object.values(COIN_IDS).join(','),
  vs_currencies: 'usd',
};

const isBrowserEnvironment = () => typeof window !== 'undefined';

const resolvePriceRequestConfig = () => {
  const apiOverride = import.meta.env.VITE_PRICE_FEED_URL?.trim();
  let endpoint = apiOverride;

  if (!endpoint) {
    if (isBrowserEnvironment()) {
      const hostname = window.location.hostname;
      const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(hostname);
      endpoint = isLocalHost ? COINGECKO_PRICE_URL : '/.netlify/functions/price-feed';
    } else {
      endpoint = COINGECKO_PRICE_URL;
    }
  }

  let url;

  try {
    url = endpoint.startsWith('http')
      ? new URL(endpoint)
      : new URL(endpoint, isBrowserEnvironment() ? window.location.origin : 'http://localhost');
  } catch (error) {
    console.warn('[useLivePriceFeed] Failed to construct price feed URL. Falling back to CoinGecko direct endpoint.', error);
    url = new URL(COINGECKO_PRICE_URL);
  }

  if (!url.searchParams.has('ids')) {
    url.searchParams.set('ids', DEFAULT_PRICE_PARAMS.ids);
  }

  if (!url.searchParams.has('vs_currencies')) {
    url.searchParams.set('vs_currencies', DEFAULT_PRICE_PARAMS.vs_currencies);
  }

  const headers = {
    accept: 'application/json',
  };

  if (url.hostname.includes('coingecko.com')) {
    const proKey = import.meta.env.VITE_COINGECKO_PRO_API_KEY?.trim();
    const demoKey = import.meta.env.VITE_COINGECKO_DEMO_API_KEY?.trim();

    if (proKey) {
      headers['x-cg-pro-api-key'] = proKey;
    } else if (demoKey) {
      headers['x-cg-demo-api-key'] = demoKey;
    }
  }

  return {
    url: url.toString(),
    headers,
  };
};
const DEFAULT_REFRESH_INTERVAL = 60_000;

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const useLivePriceFeed = ({ pollInterval = DEFAULT_REFRESH_INTERVAL } = {}) => {
  const mountedRef = useRef(false);
  const [status, setStatus] = useState('idle');
  const [bnbPriceUsd, setBnbPriceUsd] = useState(null);
  const [wagyPriceUsd, setWagyPriceUsd] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrices = useCallback(async () => {
    setStatus((previous) => (previous === 'success' ? 'refreshing' : 'loading'));
    setError(null);

    try {
        const requestConfig = resolvePriceRequestConfig();
        const response = await fetch(requestConfig.url, {
          headers: requestConfig.headers,
        });

      if (!response.ok) {
        throw new Error(`CoinGecko request failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (!mountedRef.current) return;

      const nextBnbPrice = payload?.[COIN_IDS.BNB]?.usd;
      if (!isFiniteNumber(nextBnbPrice)) {
        throw new Error('CoinGecko response missing BNB USD price');
      }

      const nextProxyPrice = payload?.[COIN_IDS.WAGY_PROXY]?.usd;

      setBnbPriceUsd(nextBnbPrice);
      setWagyPriceUsd(isFiniteNumber(nextProxyPrice) ? nextProxyPrice : null);
      setLastUpdated(new Date());
      setStatus('success');
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }

      setStatus('error');
      setError(err instanceof Error ? err : new Error('Failed to fetch live price data'));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrices();

    if (!Number.isFinite(pollInterval) || pollInterval <= 0) {
      return () => {
        mountedRef.current = false;
      };
    }

    const intervalId = setInterval(() => {
      fetchPrices();
    }, pollInterval);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchPrices, pollInterval]);

  const formatUsd = useCallback(
    (usdValue = 0, { minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) => {
      const numericValue = Number(usdValue);
      if (!Number.isFinite(numericValue)) {
        return '$0.00';
      }

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(numericValue);
    },
    [],
  );

  const formatBnbToUsd = useCallback(
    (bnbAmount = 0) => {
      const amount = Number(bnbAmount);
      if (!Number.isFinite(amount) || !isFiniteNumber(bnbPriceUsd)) return NaN;
      return amount * bnbPriceUsd;
    },
    [bnbPriceUsd],
  );

  const formattedBnbPrice = useMemo(() => {
    if (!isFiniteNumber(bnbPriceUsd)) return null;
    return formatUsd(bnbPriceUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [bnbPriceUsd, formatUsd]);

  const formattedWagyPrice = useMemo(() => {
    if (!isFiniteNumber(wagyPriceUsd)) return null;
    return formatUsd(wagyPriceUsd, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }, [formatUsd, wagyPriceUsd]);

  const isLoading = status === 'idle' || status === 'loading';
  const isRefreshing = status === 'refreshing';
  const isError = status === 'error';

  return {
    bnbPriceUsd,
    wagyPriceUsd,
    formattedBnbPrice,
    formattedWagyPrice,
    lastUpdated,
    status,
    error,
    isLoading,
    isRefreshing,
    isError,
    formatBnbToUsd,
    formatUsd,
    refetch: fetchPrices,
  };
};

export default useLivePriceFeed;
