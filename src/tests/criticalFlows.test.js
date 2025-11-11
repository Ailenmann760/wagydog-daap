import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { WagyDogSDK } from '../WagyDogSDK.ts';

afterEach(() => {
  cleanup();
});

describe('Critical Smoke Tests', () => {
  describe('Routing Check', () => {
    it('renders the App component without crashing', () => {
      expect(() =>
        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    });
  });

  describe('SDK Functionality Check', () => {
    it('initializes WagyDogSDK and returns token info from the mock fetcher', async () => {
      const mockTokenInfo = {
        address: '0xWAGYDOG_TOKEN_ADDR',
        symbol: 'WAGY',
        name: 'WagyDog Prime',
        decimals: 18,
        totalSupply: '100000000000000000000000000',
        circulatingSupply: '65000000000000000000000000',
        priceUSD: 0.0186,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };

      const mockFetcher = vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockTokenInfo,
      }));

      const sdk = new WagyDogSDK({
        baseUrl: 'https://api.wagydog.dev',
        chainId: 56,
        walletAddress: '0xUSER_WALLET',
        fetcher: mockFetcher,
      });

      const tokenInfo = await sdk.Token.getInfo('0xWAGYDOG_TOKEN_ADDR');

      expect(mockFetcher).toHaveBeenCalledOnce();
      expect(mockFetcher).toHaveBeenCalledWith('https://api.wagydog.dev/token/info', expect.any(Object));
      expect(tokenInfo).toEqual(mockTokenInfo);
    });
  });
});
