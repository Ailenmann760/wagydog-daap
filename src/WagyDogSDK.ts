/**
 * WagyDog SDK - Client-side TypeScript implementation.
 * This SDK exposes three high-level modules for interacting with the WagyDog protocol:
 * Token, Swap, and Deflationary. Each module provides simple async methods that
 * wrap HTTP calls while offering graceful fallbacks for demo usage.
 */

type FetchLike = typeof fetch;

export type WagyDogSDKConfig = {
  baseUrl: string;
  chainId: number;
  walletAddress: string;
  apiKey?: string;
  fetcher?: FetchLike;
};

export type TokenInfo = {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  circulatingSupply: string;
  priceUSD: number;
  lastUpdated: string;
};

export type BalanceInfo = {
  walletAddress: string;
  amount: string;
  usdValue: number;
  lastUpdated: string;
};

export type SwapQuote = {
  fromToken: string;
  toToken: string;
  amountIn: string;
  estimatedAmountOut: string;
  priceImpactPercent: number;
  route: string[];
  expiresAt: string;
};

export type SwapExecution = {
  hash: string;
  status: 'pending' | 'confirmed';
  submittedAt: string;
  expectedCompletion: string;
};

export type StakeReceipt = {
  hash: string;
  status: 'pending' | 'confirmed';
  stakedAmount: string;
  apy: number;
  unlockTimestamp: string;
};

class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetcher: FetchLike;

  constructor(baseUrl: string, apiKey?: string, fetcher?: FetchLike) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.fetcher = fetcher ?? globalThis.fetch.bind(globalThis);
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return this.send<T>(url.toString(), { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    return this.send<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async send<T>(url: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers ?? {});
    if (this.apiKey) {
      headers.set('x-api-key', this.apiKey);
    }

    const response = await this.fetcher(url, { ...init, headers });
    if (!response.ok) {
      throw new Error(
        `WagyDogSDK request failed (${response.status} ${response.statusText})`,
      );
    }
    return (await response.json()) as T;
  }
}

const MockData = {
  tokenInfo: {
    symbol: 'WAGY',
    name: 'WagyDog Prime',
    decimals: 18,
    totalSupply: '100000000000000000000000000',
    circulatingSupply: '65000000000000000000000000',
    priceUSD: 0.0186,
    lastUpdated: new Date().toISOString(),
  } satisfies TokenInfo,
};

function simulateDelay(min = 240, max = 420) {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function generateTxHash() {
  const rand = crypto.getRandomValues(new Uint8Array(32));
  return (
    '0x' +
    Array.from(rand)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  );
}

class TokenModule {
  private readonly client: HttpClient;
  private readonly walletAddress: string;

  constructor(client: HttpClient, walletAddress: string) {
    this.client = client;
    this.walletAddress = walletAddress;
  }

  async getInfo(): Promise<TokenInfo> {
    try {
      return await this.client.get<TokenInfo>('/token/info');
    } catch (error) {
      console.warn('[WagyDogSDK::Token.getInfo] Falling back to mock data.', error);
      await simulateDelay();
      return { ...MockData.tokenInfo, lastUpdated: new Date().toISOString() };
    }
  }

  async getBalance(walletAddress?: string): Promise<BalanceInfo> {
    const address = (walletAddress ?? this.walletAddress).toLowerCase();

    try {
      return await this.client.get<BalanceInfo>('/token/balance', { walletAddress: address });
    } catch (error) {
      console.warn('[WagyDogSDK::Token.getBalance] Falling back to mock data.', error);
      await simulateDelay();

      const floatBalance = 27543.726 + Math.random() * 1200;
      const info = await this.getInfo();
      return {
        walletAddress: address,
        amount: floatBalance.toFixed(4),
        usdValue: parseFloat((floatBalance * info.priceUSD).toFixed(2)),
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}

class SwapModule {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  async quote(params: {
    fromToken: string;
    toToken: string;
    amountIn: string;
  }): Promise<SwapQuote> {
    try {
      return await this.client.post<SwapQuote>('/swap/quote', params);
    } catch (error) {
      console.warn('[WagyDogSDK::Swap.quote] Falling back to simulated quote.', error);
      await simulateDelay();

      const amountInFloat = parseFloat(params.amountIn);
      const estimatedOut = (amountInFloat * (0.982 + Math.random() * 0.01)).toFixed(6);
      return {
        fromToken: params.fromToken,
        toToken: params.toToken,
        amountIn: params.amountIn,
        estimatedAmountOut: estimatedOut,
        priceImpactPercent: parseFloat((Math.random() * 0.65).toFixed(3)),
        route: ['WAGY', 'WBNB', params.toToken],
        expiresAt: new Date(Date.now() + 1000 * 60 * 3).toISOString(),
      };
    }
  }

  async execute(payload: {
    fromToken: string;
    toToken: string;
    amountIn: string;
    minAmountOut: string;
  }): Promise<SwapExecution> {
    try {
      return await this.client.post<SwapExecution>('/swap/execute', payload);
    } catch (error) {
      console.warn('[WagyDogSDK::Swap.execute] Falling back to simulated swap.', error);
      await simulateDelay();

      return {
        hash: generateTxHash(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
        expectedCompletion: new Date(Date.now() + 1000 * 45).toISOString(),
      };
    }
  }
}

class DeflationaryModule {
  private readonly client: HttpClient;
  private readonly walletAddress: string;

  constructor(client: HttpClient, walletAddress: string) {
    this.client = client;
    this.walletAddress = walletAddress;
  }

  async stake(amount: string): Promise<StakeReceipt> {
    const payload = { walletAddress: this.walletAddress, amount };

    try {
      return await this.client.post<StakeReceipt>('/deflationary/stake', payload);
    } catch (error) {
      console.warn('[WagyDogSDK::Deflationary.stake] Falling back to simulated stake.', error);
      await simulateDelay();

      return {
        hash: generateTxHash(),
        status: 'pending',
        stakedAmount: amount,
        apy: parseFloat((18 + Math.random() * 4).toFixed(2)),
        unlockTimestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      };
    }
  }

  async unstake(amount: string): Promise<StakeReceipt> {
    const payload = { walletAddress: this.walletAddress, amount };

    try {
      return await this.client.post<StakeReceipt>('/deflationary/unstake', payload);
    } catch (error) {
      console.warn('[WagyDogSDK::Deflationary.unstake] Falling back to simulated unstake.', error);
      await simulateDelay();

      return {
        hash: generateTxHash(),
        status: 'pending',
        stakedAmount: `-${amount}`,
        apy: 0,
        unlockTimestamp: new Date().toISOString(),
      };
    }
  }
}

export class WagyDogSDK {
  readonly config: WagyDogSDKConfig;
  readonly Token: TokenModule;
  readonly Swap: SwapModule;
  readonly Deflationary: DeflationaryModule;

  constructor(config: WagyDogSDKConfig) {
    if (!config.baseUrl) {
      throw new Error('WagyDogSDK requires a baseUrl.');
    }
    if (!config.chainId) {
      throw new Error('WagyDogSDK requires a chainId.');
    }
    if (!config.walletAddress) {
      throw new Error('WagyDogSDK requires the current walletAddress.');
    }

    this.config = { ...config };
    const client = new HttpClient(config.baseUrl, config.apiKey, config.fetcher);

    this.Token = new TokenModule(client, config.walletAddress);
    this.Swap = new SwapModule(client);
    this.Deflationary = new DeflationaryModule(client, config.walletAddress);
  }

  /**
   * Utility helper that refreshes the SDK with a new wallet address while preserving other options.
   */
  withWallet(walletAddress: string): WagyDogSDK {
    return new WagyDogSDK({
      ...this.config,
      walletAddress,
    });
  }
}
