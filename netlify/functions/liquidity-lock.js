const DEFAULT_BASE_URL = 'https://api.dexscreener.com/latest/dex/pairs';
const DEFAULT_NETWORK = 'bsc';
const DEFAULT_TIMEOUT_MS = Number(process.env.LIQUIDITY_TIMEOUT_MS || 6000);

const buildHeaders = (statusOverrides = {}) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': statusOverrides['Cache-Control'] || 'public, max-age=30, s-maxage=60, stale-while-revalidate=180',
  ...statusOverrides,
});

const respond = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: buildHeaders(headers),
  body: JSON.stringify(body),
});

const sanitisePairAddress = (value) => value?.trim().toLowerCase() || null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(`Liquidity provider request timed out after ${DEFAULT_TIMEOUT_MS}ms`);
      timeoutError.code = 'ETIMEDOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const parseDexScreenerResponse = (payload, pairAddress) => {
  if (!payload) {
    throw new Error('Liquidity provider returned an empty payload');
  }

  if (typeof payload.lockedUsd === 'number') {
    return {
      lockedUsd: payload.lockedUsd,
      provider: payload.provider || 'custom',
      pair: payload,
    };
  }

  const pairs = Array.isArray(payload.pairs) ? payload.pairs : [];
  if (pairs.length === 0) {
    throw new Error('Liquidity provider returned no pairs');
  }

  const normalizedPair = pairAddress?.toLowerCase();
  const match =
    pairs.find((item) => item?.pairAddress?.toLowerCase() === normalizedPair) ?? pairs[0];

  if (!match) {
    throw new Error('Liquidity provider response did not include the requested pair');
  }

  const liquidityUsd = match?.liquidity?.usd ?? match?.liquidityUsd ?? match?.lockedUsd;
  const lockedUsd = Number(liquidityUsd);

  if (!Number.isFinite(lockedUsd)) {
    throw new Error('Liquidity provider response missing liquidity.usd figure');
  }

  return {
    lockedUsd,
    provider: payload.provider || 'dexscreener',
    pair: match,
  };
};

const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

const shouldRetry = (error) => {
  if (!error) return false;
  if (error.code === 'ETIMEDOUT') return true;
  if (typeof error.status === 'number' && retryableStatuses.has(error.status)) return true;
  return false;
};

const fetchLiquidity = async ({ baseUrl, network, pairAddress, apiKey, maxAttempts = 2 }) => {
  const trimmedBase = baseUrl.replace(/\/$/, '');
  const requestUrl = `${trimmedBase}/${network}/${pairAddress}`;

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const response = await fetchWithTimeout(requestUrl, {
        headers: {
          accept: 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
      });

      const providerRequestId = response.headers.get('x-request-id') || null;

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || '15';
        const error = new Error('Liquidity provider rate limited the request');
        error.status = 429;
        error.retryAfter = retryAfter;
        throw error;
      }

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Liquidity provider request failed (${response.status} ${response.statusText})`,
        );
        error.status = response.status;
        error.body = errorText;
        throw error;
      }

      const payload = await response.json();
      const parsed = parseDexScreenerResponse(payload, pairAddress);

      return {
        lockedUsd: Math.round(Number(parsed.lockedUsd)),
        meta: {
          provider: parsed.provider,
          pair: parsed.pair ?? null,
          providerRequestId,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!shouldRetry(lastError) || attempt >= maxAttempts) {
        throw lastError;
      }

      const backoff = 250 * attempt ** 1.5;
      await delay(backoff);
    }
  }

  throw lastError;
};

export const handler = async (event) => {
  const queryPair = sanitisePairAddress(event.queryStringParameters?.pairAddress);
  const queryNetwork = event.queryStringParameters?.network?.trim();

  const pairAddress = queryPair || sanitisePairAddress(process.env.LIQUIDITY_PAIR_ADDRESS);
  if (!pairAddress) {
    return respond(400, {
      error: 'Missing pair address',
      message: 'Pass ?pairAddress=0x... or configure LIQUIDITY_PAIR_ADDRESS',
    });
  }

  const network = (queryNetwork || process.env.LIQUIDITY_NETWORK || DEFAULT_NETWORK).trim();
  const baseUrl = (process.env.LIQUIDITY_API_BASE || DEFAULT_BASE_URL).trim();
  const apiKey = process.env.LIQUIDITY_PROVIDER_API_KEY || null;

  try {
    const { lockedUsd, meta } = await fetchLiquidity({
      baseUrl,
      network,
      pairAddress,
      apiKey,
      maxAttempts: Number(process.env.LIQUIDITY_MAX_ATTEMPTS || 2),
    });

    const pair = meta.pair || {};

    return respond(200, {
      lockedUsd,
      network,
      pairAddress,
      provider: meta.provider,
      fetchedAt: new Date().toISOString(),
      providerRequestId: meta.providerRequestId,
      liquidityBase:
        typeof pair?.liquidity?.base === 'number'
          ? pair.liquidity.base
          : Number(pair?.liquidity?.base ?? 0) || null,
      liquidityQuote:
        typeof pair?.liquidity?.quote === 'number'
          ? pair.liquidity.quote
          : Number(pair?.liquidity?.quote ?? 0) || null,
      baseToken: pair?.baseToken?.symbol || null,
      quoteToken: pair?.quoteToken?.symbol || null,
    });
  } catch (error) {
    if (error instanceof Error && error.code === 'ETIMEDOUT') {
      return respond(
        504,
        {
          error: 'Liquidity provider timeout',
          message: error.message,
        },
        {
          'Cache-Control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=30',
        },
      );
    }

    if (error instanceof Error && typeof error.status === 'number') {
      const retryAfterHeader = error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {};
      return respond(
        error.status,
        {
          error: error.message,
          status: error.status,
          details: error.body || null,
        },
        {
          'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=45',
          ...retryAfterHeader,
        },
      );
    }

    return respond(
      502,
      {
        error: 'Unexpected liquidity provider error',
        message: error instanceof Error ? error.message : String(error),
      },
      {
        'Cache-Control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=30',
      },
    );
  }
};
