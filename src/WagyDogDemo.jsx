import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { Wallet } from 'ethers';
import { WagyDogSDK } from './WagyDogSDK';

const sdkConfig = {
  baseUrl: 'https://demo-api.wagydog.dev',
  chainId: 97, // BNB Chain Testnet
  apiKey: 'public-demo-key',
};

function useFirebaseAuth() {
  const appRef = useRef(null);
  const authRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const boot = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      const firebaseConfig = window.__firebase_config;
      const customToken = window.__initial_auth_token;

      if (!firebaseConfig) {
        setError('Missing global __firebase_config.');
        setStatus('error');
        return;
      }

      if (!customToken) {
        setError('Missing global __initial_auth_token.');
        setStatus('error');
        return;
      }

      try {
        if (!appRef.current) {
          const existingApp = getApps().find((app) => app.name === '[DEFAULT]');
          appRef.current = existingApp ?? initializeApp(firebaseConfig);
        }

        authRef.current = getAuth(appRef.current);

        unsubscribe = onAuthStateChanged(authRef.current, (authUser) => {
          if (authUser) {
            setUser(authUser);
            setStatus('authenticated');
          }
        });

        await signInWithCustomToken(authRef.current, customToken);
      } catch (err) {
        console.error('[WagyDogDemo] Firebase initialization failed:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    };

    boot();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { status, error, user };
}

export default function WagyDogDemo() {
  const { status: authStatus, error: authError, user } = useFirebaseAuth();
  const walletRef = useRef(null);

  if (!walletRef.current) {
    walletRef.current = Wallet.createRandom();
  }

  const walletAddress = walletRef.current.address;

  const sdk = useMemo(() => {
    if (authStatus !== 'authenticated') return null;
    try {
      return new WagyDogSDK({
        ...sdkConfig,
        walletAddress,
      });
    } catch (err) {
      console.error('[WagyDogDemo] Failed to instantiate WagyDogSDK:', err);
      return null;
    }
  }, [authStatus, walletAddress]);

  const [tokenInfo, setTokenInfo] = useState(null);
  const [balanceInfo, setBalanceInfo] = useState(null);
  const [stakeReceipt, setStakeReceipt] = useState(null);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleFetchTokenData = useCallback(async () => {
    if (!sdk) return;

    setIsFetchingToken(true);
    setActionError(null);

    try {
      const [info, balance] = await Promise.all([
        sdk.Token.getInfo(),
        sdk.Token.getBalance(walletAddress),
      ]);
      setTokenInfo(info);
      setBalanceInfo(balance);
    } catch (err) {
      console.error('[WagyDogDemo] Failed to fetch token data:', err);
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsFetchingToken(false);
    }
  }, [sdk, walletAddress]);

  const handleSimulateStake = useCallback(async () => {
    if (!sdk) return;

    setIsStaking(true);
    setActionError(null);

    try {
      const receipt = await sdk.Deflationary.stake('5000');
      setStakeReceipt(receipt);
    } catch (err) {
      console.error('[WagyDogDemo] Failed to simulate staking:', err);
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsStaking(false);
    }
  }, [sdk]);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="bg-slate-900/80 border border-slate-800 px-10 py-12 rounded-3xl shadow-2xl shadow-blue-500/10 backdrop-blur-xl flex flex-col items-center gap-6">
          <span className="w-14 h-14 rounded-full border-4 border-emerald-500/40 border-t-blue-500 animate-spin" />
          <div className="text-center">
            <p className="text-xl font-semibold tracking-wide text-slate-100">Connecting to Firebase</p>
            <p className="text-sm text-slate-400 mt-2">Authenticating with WagyDog cloud services…</p>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="max-w-lg w-full bg-slate-900/80 border border-red-500/40 shadow-red-500/20 shadow-xl rounded-3xl p-10 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold text-red-300 tracking-wide">Authentication Error</h1>
          <p className="text-slate-300 mt-4 leading-relaxed">
            We could not initialize Firebase authentication for the WagyDog demo environment.
          </p>
          <p className="mt-6 text-sm text-red-200/90 font-mono break-words">
            {authError ?? 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="bg-slate-900/70 border border-slate-800/80 rounded-3xl px-10 py-12 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-300 text-sm font-semibold uppercase tracking-[0.3em]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.65)]" />
            Live Demo
          </div>
          <h1 className="mt-6 text-4xl lg:text-5xl font-bold tracking-tight text-slate-50">
            WagyDog SDK – DeFi Control Surface
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl leading-relaxed">
            This interactive surface authenticates against Firebase, provisions a demo wallet, and showcases
            the core WagyDog SDK flows for token discovery and deflationary staking strategies.
          </p>
          {user && (
            <div className="mt-6 text-sm text-slate-400">
              Signed in as <span className="font-medium text-emerald-300">{user.email ?? user.uid}</span>
            </div>
          )}
        </header>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-blue-500/5 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">Wallet & Token Controls</h2>
            <p className="mt-2 text-sm text-slate-400">
              Interact with WagyDog liquidity primitives. Fetch live token intelligence and simulate the deflationary staking flow.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-[0.4em]">User Wallet Address</p>
                <p className="mt-2 font-mono text-sm bg-slate-950/60 border border-slate-800/70 rounded-2xl px-4 py-3 text-emerald-300 break-all shadow-inner shadow-emerald-500/5">
                  {walletAddress}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <button
                  type="button"
                  onClick={handleFetchTokenData}
                  disabled={!sdk || isFetchingToken}
                  className="group flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-500 text-slate-50 font-semibold py-3 px-5 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isFetchingToken ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                      Fetching…
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                      Fetch Token Info &amp; Balance
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateStake}
                  disabled={!sdk || isStaking}
                  className="group flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-800/80 border border-emerald-500/40 text-emerald-200 font-semibold py-3 px-5 shadow-lg shadow-emerald-500/10 transition-all hover:bg-slate-800 hover:border-emerald-400 hover:text-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStaking ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-emerald-300/40 border-t-transparent animate-spin" />
                      Simulating…
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
                      Simulate Staking
                    </>
                  )}
                </button>
              </div>

              {actionError && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200 shadow-inner shadow-red-500/10">
                  {actionError}
                </div>
              )}
            </div>
          </div>

          <aside className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-emerald-500/5 backdrop-blur-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-50">Token Intelligence</h3>
              {tokenInfo ? (
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Name</dt>
                    <dd className="font-semibold text-slate-100">{tokenInfo.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Symbol</dt>
                    <dd className="font-semibold text-emerald-300">{tokenInfo.symbol}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Price (USD)</dt>
                    <dd className="font-semibold text-blue-300">${tokenInfo.priceUSD.toFixed(4)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Total Supply</dt>
                    <dd className="font-mono text-slate-200">{tokenInfo.totalSupply}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Last Updated</dt>
                    <dd className="font-mono text-xs text-slate-400">
                      {new Date(tokenInfo.lastUpdated).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Press <span className="text-emerald-300 font-semibold">Fetch Token Info &amp; Balance</span> to pull analytics from the SDK.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-50">Wallet Balance</h3>
              {balanceInfo ? (
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Amount</dt>
                    <dd className="font-semibold text-slate-100">{balanceInfo.amount} WAGY</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">USD Value</dt>
                    <dd className="font-semibold text-emerald-300">${balanceInfo.usdValue.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Time</dt>
                    <dd className="font-mono text-xs text-slate-400">
                      {new Date(balanceInfo.lastUpdated).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Balance data becomes available after fetching token information.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-50">Staking Simulation</h3>
              {stakeReceipt ? (
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Tx Hash</dt>
                    <dd className="font-mono text-xs text-blue-300 break-all">{stakeReceipt.hash}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Status</dt>
                    <dd className="font-semibold text-emerald-300 capitalize">{stakeReceipt.status}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Staked Amount</dt>
                    <dd className="font-semibold text-slate-100">{stakeReceipt.stakedAmount} WAGY</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Projected APY</dt>
                    <dd className="font-semibold text-emerald-300">{stakeReceipt.apy}%</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Unlocks</dt>
                    <dd className="font-mono text-xs text-slate-400">
                      {new Date(stakeReceipt.unlockTimestamp).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Initiate the staking simulation to view the generated transaction receipt.
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
