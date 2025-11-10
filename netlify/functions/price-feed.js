const DEFAULT_IDS = ['binancecoin', 'ethereum'];
const DEFAULT_VS_CURRENCIES = 'usd';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';

const buildHeaders = () => {
  const headers = {
    accept: 'application/json',
  };

  const proKey =
    process.env.CG_PRO_API_KEY ||
    process.env.COINGECKO_PRO_API_KEY ||
    process.env.COINGECKO_API_KEY;

  const demoKey =
    process.env.CG_DEMO_API_KEY ||
    process.env.COINGECKO_DEMO_API_KEY ||
    process.env.COINGECKO_DEMO_KEY;

  if (proKey) {
    headers['x-cg-pro-api-key'] = proKey;
  } else if (demoKey) {
    headers['x-cg-demo-api-key'] = demoKey;
  }

  return headers;
};

export const handler = async (event) => {
  const idsParam = event.queryStringParameters?.ids || DEFAULT_IDS.join(',');
  const vsCurrenciesParam = event.queryStringParameters?.vs_currencies || DEFAULT_VS_CURRENCIES;

  const searchParams = new URLSearchParams({
    ids: idsParam,
    vs_currencies: vsCurrenciesParam,
  });

  const requestUrl = `${COINGECKO_BASE_URL}?${searchParams.toString()}`;

  try {
    const response = await fetch(requestUrl, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60',
        },
        body: JSON.stringify({
          error: 'Failed to fetch CoinGecko prices',
          status: response.status,
          details: errorBody,
        }),
      };
    }

    const payload = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=180',
      },
      body: payload,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60',
      },
      body: JSON.stringify({
        error: 'Unexpected error while requesting CoinGecko prices',
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
