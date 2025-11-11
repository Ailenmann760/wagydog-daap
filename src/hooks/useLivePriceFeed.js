/**
 * Environment Requirements:
 * - VITE_COINGECKO_API_KEY: Optional CoinGecko API key to improve rate limits when calling the live price feed.
 * - VITE_COINGECKO_PRO_API_KEY / VITE_COINGECKO_DEMO_API_KEY: Existing keys remain supported for CoinGecko direct access.
 */
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
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RETRIES = 3;

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

let lastPriceData = null;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getFreshCache = () => {
  if (!lastPriceData) return null;
  return Date.now() - lastPriceData.timestamp < CACHE_TTL_MS ? lastPriceData : null;
};

const useLivePriceFeed = ({ pollInterval = DEFAULT_REFRESH_INTERVAL } = {}) => {
  const mountedRef = useRef(false);
  const [status, setStatus] = useState('idle');
  const [bnbPriceUsd, setBnbPriceUsd] = useState(null);
  const [wagyPriceUsd, setWagyPriceUsd] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrices = useCallback(async ({ force = false } = {}) => {
    if (!mountedRef.current) {
      return;
    }

    const cached = !force ? getFreshCache() : null;
    if (cached) {
      setBnbPriceUsd(cached.bnbPriceUsd ?? null);
      setWagyPriceUsd(cached.wagyPriceUsd ?? null);
      setLastUpdated(new Date(cached.timestamp));
      setStatus('success');
      setError(null);
      return;
    }

    setStatus((previous) => (previous === 'success' ? 'refreshing' : 'loading'));
    setError(null);

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const requestConfig = resolvePriceRequestConfig();
        const response = await fetch(requestConfig.url, {
          headers: requestConfig.headers,
        });

        if (!response.ok) {
          const error = new Error(`CoinGecko request failed with status ${response.status}`);
          if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
            error.retryable = true;
          }
          throw error;
        }

        const payload = await response.json();
        if (!mountedRef.current) return;

        const nextBnbPrice = payload?.[COIN_IDS.BNB]?.usd;
        if (!isFiniteNumber(nextBnbPrice)) {
          throw new Error('CoinGecko response missing BNB USD price');
        }

        const nextProxyPrice = payload?.[COIN_IDS.WAGY_PROXY]?.usd;
        const resolvedProxyPrice = isFiniteNumber(nextProxyPrice) ? nextProxyPrice : null;

        lastPriceData = {
          bnbPriceUsd: nextBnbPrice,
          wagyPriceUsd: resolvedProxyPrice,
          timestamp: Date.now(),
        };

        setBnbPriceUsd(nextBnbPrice);
        setWagyPriceUsd(resolvedProxyPrice);
        setLastUpdated(new Date(lastPriceData.timestamp));
        setStatus('success');
        setError(null);
        return;
      } catch (caughtError) {
        const error = caughtError instanceof Error ? caughtError : new Error('Failed to fetch live price data');
        const isRetryable =
          Boolean(error.retryable) ||
          error.name === 'TypeError' ||
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('fetch');

        lastError = error;

        const isLastAttempt = attempt === MAX_RETRIES || !isRetryable;
        if (isLastAttempt) {
          break;
        }

        const backoffDelayMs = 1000 * 2 ** (attempt + 1);
        await sleep(backoffDelayMs);
        if (!mountedRef.current) {
          return;
        }
      }
    }

    if (!mountedRef.current) {
      return;
    }

    if (lastPriceData) {
      setBnbPriceUsd(lastPriceData.bnbPriceUsd ?? null);
      setWagyPriceUsd(lastPriceData.wagyPriceUsd ?? null);
      setLastUpdated(new Date(lastPriceData.timestamp));
    }

    setStatus('error');
    setError(lastError || new Error('Failed to fetch live price data after retries'));
    console.error('[useLivePriceFeed] Failed to fetch live price data after retries.', lastError);
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
