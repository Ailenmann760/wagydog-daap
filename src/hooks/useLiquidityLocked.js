import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_REFRESH_INTERVAL = 30_000;
const REQUEST_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 45_000;
const STORAGE_KEY = 'wagydog:liquidity-lock';

const telemetryEndpoint = import.meta.env.VITE_TELEMETRY_ENDPOINT?.trim();
const liquidityEndpoint =
  import.meta.env.VITE_LIQUIDITY_LOCKED_URL?.trim() || '/.netlify/functions/liquidity-lock';
const liquidityApiKey = import.meta.env.VITE_LIQUIDITY_LOCKED_API_KEY?.trim();
const liquidityPairOverride = import.meta.env.VITE_LIQUIDITY_PAIR_ADDRESS?.trim()?.toLowerCase();

let inFlightRequest = null;
let memoryCache = null;

const safeParseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dispatchTelemetry = (eventType, detail) => {
  const payload = {
    component: 'useLiquidityLocked',
    eventType,
    timestamp: new Date().toISOString(),
    ...detail,
  };

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('wagydog:telemetry', { detail: payload }));
    } catch (error) {
      console.debug('[LiquidityTelemetry] Failed to dispatch custom event', error);
    }
  }

  if (!telemetryEndpoint) {
    const logger = eventType.endsWith('error') ? console.error : console.info;
    logger('[LiquidityTelemetry]', payload);
    return;
  }

  try {
    const body = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(telemetryEndpoint, blob);
      return;
    }

    fetch(telemetryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch((error) => {
      console.debug('[LiquidityTelemetry] Failed to send telemetry', error);
    });
  } catch (error) {
    console.debug('[LiquidityTelemetry] Telemetry serialization failed', error);
  }
};

const readStorageCache = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed?.lockedUsd !== 'number' || typeof parsed?.timestamp !== 'string') {
      return null;
    }

    const timestamp = safeParseDate(parsed.timestamp);
    if (!timestamp) return null;

    return {
      lockedUsd: parsed.lockedUsd,
      timestamp,
      timestampMs: timestamp.getTime(),
      metadata: parsed.metadata ?? null,
      source: 'storage',
    };
  } catch (error) {
    console.debug('[useLiquidityLocked] Failed to parse storage cache', error);
    return null;
  }
};

const writeStorageCache = (payload) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const data = {
      lockedUsd: payload.lockedUsd,
      timestamp: payload.timestamp.toISOString(),
      metadata: payload.metadata ?? null,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.debug('[useLiquidityLocked] Failed to persist storage cache', error);
  }
};

const getCachedResult = () => {
  if (memoryCache) {
    return memoryCache;
  }

  const storageCache = readStorageCache();
  if (storageCache) {
    memoryCache = storageCache;
    return storageCache;
  }

  return null;
};

const setCache = (payload) => {
  memoryCache = payload;
  writeStorageCache(payload);
};

const shouldRefresh = (cached, force) => {
  if (force) return true;
  if (!cached) return true;
  return Date.now() - cached.timestampMs > CACHE_TTL_MS;
};

const normaliseMetadata = (payload) => {
  if (!payload) return null;
  const { provider, network, pairAddress, providerRequestId } = payload;

  return {
    provider: provider ?? null,
    network: network ?? null,
    pairAddress: pairAddress ?? null,
    providerRequestId: providerRequestId ?? null,
  };
};

const parseLiquidityPayload = (payload) => {
  if (!payload) {
    throw new Error('Liquidity response was empty');
  }

  if (typeof payload.lockedUsd === 'number') {
    return {
      lockedUsd: payload.lockedUsd,
      timestamp: safeParseDate(payload.fetchedAt) ?? safeParseDate(payload.timestamp) ?? new Date(),
      metadata: normaliseMetadata(payload),
    };
  }

  if (payload.data && typeof payload.data.lockedUsd === 'number') {
    return {
      lockedUsd: payload.data.lockedUsd,
      timestamp: safeParseDate(payload.data.timestamp) ?? new Date(),
      metadata: normaliseMetadata(payload.data),
    };
  }

  const pairs = Array.isArray(payload.pairs) ? payload.pairs : [];
  if (pairs.length === 0) {
    throw new Error('Liquidity response did not include any pairs');
  }

  const normalizedPair = liquidityPairOverride;
  const match =
    pairs.find((item) => item?.pairAddress?.toLowerCase() === normalizedPair) ?? pairs[0];

  if (!match) {
    throw new Error('Liquidity response missing requested pair data');
  }

  const liquidityUsd = match?.liquidity?.usd ?? match?.liquidityUsd ?? match?.lockedUsd;
  const lockedUsd = Number(liquidityUsd);

  if (!Number.isFinite(lockedUsd)) {
    throw new Error('Liquidity response missing liquidity.usd figure');
  }

  const timestamp =
    safeParseDate(match?.priceChange?.timestamp) ??
    safeParseDate(match?.fetchedAt) ??
    safeParseDate(payload.fetchedAt) ??
    new Date();

  return {
    lockedUsd,
    timestamp,
    metadata: normaliseMetadata({
      provider: payload.provider ?? 'dexscreener',
      network: payload.network ?? payload.chainId ?? null,
      pairAddress: match.pairAddress ?? null,
    }),
  };
};

const isRetryable = (error) => {
  if (!(error instanceof Error)) return false;
  if (error.name === 'AbortError') return true;
  if (error.code === 'ETIMEDOUT') return true;
  if (typeof error.status === 'number') {
    return [408, 425, 429, 500, 502, 503, 504].includes(error.status);
  }
  return false;
};

const buildRequestUrl = () => {
  if (!liquidityEndpoint) {
    throw new Error('Liquidity endpoint is not configured. Set VITE_LIQUIDITY_LOCKED_URL.');
  }

  if (liquidityEndpoint.startsWith('http')) {
    const url = new URL(liquidityEndpoint);
    if (liquidityPairOverride && !url.searchParams.has('pairAddress')) {
      url.searchParams.set('pairAddress', liquidityPairOverride);
    }
    return url.toString();
  }

  if (typeof window === 'undefined') {
    return liquidityEndpoint;
  }

  const url = new URL(liquidityEndpoint, window.location.origin);
  if (liquidityPairOverride && !url.searchParams.has('pairAddress')) {
    url.searchParams.set('pairAddress', liquidityPairOverride);
  }
  return url.toString();
};

const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        ...(liquidityApiKey ? { 'x-api-key': liquidityApiKey } : {}),
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const performNetworkRequest = async () => {
  const requestUrl = buildRequestUrl();
  let attempt = 0;
  let lastError;

  while (attempt < 3) {
    attempt += 1;
    try {
      const response = await fetchWithTimeout(requestUrl);
      const requestId = response.headers.get('x-request-id') || null;

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const error = new Error('Liquidity provider rate-limited the request');
        error.status = 429;
        error.retryAfter = retryAfter;
        throw error;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(
          `Liquidity endpoint responded with ${response.status} ${response.statusText}`,
        );
        error.status = response.status;
        error.body = errorBody;
        throw error;
      }

      const payload = await response.json();
      const parsed = parseLiquidityPayload(payload);

      const result = {
        lockedUsd: Math.round(Number(parsed.lockedUsd)),
        timestamp: parsed.timestamp ?? new Date(),
        timestampMs: (parsed.timestamp ?? new Date()).getTime(),
        metadata: {
          ...(parsed.metadata ?? {}),
          requestUrl,
          requestId,
        },
        source: 'network',
      };

      dispatchTelemetry('liquidity_fetch_success', {
        lockedUsd: result.lockedUsd,
        attempt,
        requestId,
      });

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      dispatchTelemetry('liquidity_fetch_error', {
        message: lastError.message,
        attempt,
        status: lastError.status ?? null,
      });

      if (!isRetryable(lastError) || attempt >= 3) {
        throw lastError;
      }

      const backoff = 300 * attempt ** 1.5;
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw lastError;
};

const loadLiquidity = async (force = false) => {
  const cached = getCachedResult();

  if (!shouldRefresh(cached, force)) {
    return cached;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = performNetworkRequest()
    .then((result) => {
      setCache(result);
      return result;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
};

const useLiquidityLocked = ({ pollInterval = DEFAULT_REFRESH_INTERVAL } = {}) => {
  const mountedRef = useRef(true);
  const [status, setStatus] = useState('idle');
  const [lockedUsd, setLockedUsd] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const hydrateFromCache = useCallback(() => {
    const cached = getCachedResult();
    if (!cached) return false;

    setLockedUsd(cached.lockedUsd);
    setLastUpdated(cached.timestamp);
    setStatus('success');
    return true;
  }, []);

  const fetchLockedLiquidity = useCallback(
    async (options = { force: false }) => {
      const force = Boolean(options?.force);

      const cachedForImmediateUse = getCachedResult();
      if (cachedForImmediateUse && !force) {
        setLockedUsd(cachedForImmediateUse.lockedUsd);
        setLastUpdated(cachedForImmediateUse.timestamp);
        setStatus('success');
      }

      if (!shouldRefresh(cachedForImmediateUse, force)) {
        return;
      }

      setStatus((previous) => (previous === 'success' ? 'refreshing' : 'loading'));
      setError(null);

      try {
        const result = await loadLiquidity(force);
        if (!mountedRef.current) return;

        setLockedUsd(result.lockedUsd);
        setLastUpdated(result.timestamp);
        setStatus('success');
      } catch (err) {
        if (!mountedRef.current) return;

        const normalizedError =
          err instanceof Error ? err : new Error('Failed to load liquidity data');

        setStatus('error');
        setError(normalizedError);
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    hydrateFromCache();

    fetchLockedLiquidity({ force: true });

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
  }, [fetchLockedLiquidity, hydrateFromCache, pollInterval]);

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
    refresh: () => fetchLockedLiquidity({ force: true }),
  };
};

export default useLiquidityLocked;
