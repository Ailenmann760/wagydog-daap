import { useMemo } from 'react';

const BNB_TO_USD_RATE = 285.5;

/**
 * Placeholder pricing hook.
 *
 * Integration point for a future live oracle/API feed (CoinGecko, Chainlink, etc.).
 */
const useLivePriceFeed = () =>
  useMemo(
    () => ({
      bnbToUsd: BNB_TO_USD_RATE,
      formatBnbToUsd: (bnbAmount = 0) => Number(bnbAmount) * BNB_TO_USD_RATE,
      source: 'placeholder',
    }),
    [],
  );

export default useLivePriceFeed;
