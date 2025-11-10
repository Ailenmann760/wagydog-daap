import { useMemo, useState } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits, parseEther } from 'viem';
import { ArrowRight, Loader } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/blockchain.js';

const TOKEN_DECIMALS = 18;
const BNB_DECIMALS = 18;
const DEFAULT_TOKENS_PER_NATIVE = 50_000_000;

const SwapComponent = () => {
  const { address, isConnected } = useAccount();
  const [bnbAmount, setBnbAmount] = useState('0.1');
  const { writeContract, isPending, isSuccess, isError } = useWriteContract();

  const parsedBnbAmount = useMemo(() => {
    try {
      return parseEther(bnbAmount || '0');
    } catch {
      return 0n;
    }
  }, [bnbAmount]);

  const tokensPerNativeQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokensPerNative',
    query: {
      staleTime: 60_000,
      refetchInterval: 120_000,
    },
  });

  const amountOutQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAmountOut',
    args: [parsedBnbAmount],
    query: {
      enabled: parsedBnbAmount > 0n,
      refetchInterval: 60_000,
    },
  });

  const nativeBalanceQuery = useBalance({
    address,
    query: {
      enabled: Boolean(address),
    },
  });

  const wagyBalanceQuery = useBalance({
    address,
    token: CONTRACT_ADDRESS,
    query: {
      enabled: Boolean(address),
    },
  });

  const handleSwap = (event) => {
    event.preventDefault();
    if (!isConnected || !bnbAmount) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'buyTokens',
      value: parseEther(bnbAmount),
    });
  };

  const tokensPerNative = useMemo(() => {
    if (tokensPerNativeQuery.data != null) {
      return Number.parseFloat(formatUnits(tokensPerNativeQuery.data, TOKEN_DECIMALS));
    }
    return DEFAULT_TOKENS_PER_NATIVE;
  }, [tokensPerNativeQuery.data]);

  const estimatedWagy = useMemo(() => {
    if (!bnbAmount) return 0;

    if (amountOutQuery.data != null) {
      return Number.parseFloat(formatUnits(amountOutQuery.data, TOKEN_DECIMALS));
    }

    const amountAsNumber = Number.parseFloat(bnbAmount);
    if (!Number.isFinite(amountAsNumber)) return 0;

    return amountAsNumber * tokensPerNative;
  }, [amountOutQuery.data, bnbAmount, tokensPerNative]);

  const rateDisplay = useMemo(() => {
    if (amountOutQuery.isFetching) return 'Fetching latest rate…';
    if (tokensPerNativeQuery.isFetching) return 'Refreshing rate…';

    if (amountOutQuery.data != null) {
      const amountInBnb = Number.parseFloat(formatUnits(parsedBnbAmount || 0n, BNB_DECIMALS)) || 1;
      const perBnb = Number.parseFloat(formatUnits(amountOutQuery.data, TOKEN_DECIMALS)) / (amountInBnb || 1);
      if (Number.isFinite(perBnb) && perBnb > 0) {
        return `1 BNB ≈ ${perBnb.toLocaleString(undefined, { maximumFractionDigits: 2 })} WAGY`;
      }
    }

    if (tokensPerNative > 0) {
      return `1 BNB ≈ ${tokensPerNative.toLocaleString(undefined, { maximumFractionDigits: 2 })} WAGY`;
    }

    return 'Rate unavailable';
  }, [amountOutQuery.data, amountOutQuery.isFetching, parsedBnbAmount, tokensPerNative, tokensPerNativeQuery.isFetching]);

  const formatBalance = (balanceQuery, symbol) => {
    if (balanceQuery.isLoading) return 'Loading…';
    if (!balanceQuery.data) return '—';
    return `${Number.parseFloat(balanceQuery.data.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
  };

  return (
    <div
      className="surface-glass"
      style={{
        padding: '2rem',
        maxWidth: '520px',
        margin: '0 auto',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-elevated)',
        background: 'var(--gradient-surface)',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1.5rem', textAlign: 'center' }}>
        Buy WAGY with BNB
      </h2>
      <p style={{ margin: '0 0 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        {rateDisplay}
      </p>
      {!isConnected ? (
        <p style={{ textAlign: 'center', color: 'var(--color-danger)' }}>
          Please connect your wallet to start swapping.
        </p>
      ) : (
        <form onSubmit={handleSwap} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label htmlFor="bnb-amount" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              BNB Amount (You Pay)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Balance: {formatBalance(nativeBalanceQuery, 'BNB')}
            </span>
            <input
              id="bnb-amount"
              type="number"
              value={bnbAmount}
              onChange={(e) => setBnbAmount(e.target.value)}
              placeholder="0.0"
              step="any"
              min="0.0001"
              required
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-text)',
              }}
            />
          </div>

          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <ArrowRight size={24} style={{ color: 'var(--color-primary-accent)' }} />
          </div>

          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              WAGY Amount (You Receive)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Balance: {formatBalance(wagyBalanceQuery, 'WAGY')}
            </span>
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              ~{Number.isFinite(estimatedWagy) ? estimatedWagy.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.0'} WAGY (Estimate)
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !bnbAmount}
            className="button-primary"
            style={{
              width: '100%',
              opacity: isPending || !bnbAmount ? 0.6 : 1,
              cursor: isPending || !bnbAmount ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {isPending ? <Loader className="animate-spin" size={20} /> : 'Execute Swap'}
          </button>

          {isSuccess && (
            <p style={{ textAlign: 'center', color: 'var(--color-primary-accent)', margin: 0 }}>
              Transaction successful!
            </p>
          )}
          {isError && (
            <p style={{ textAlign: 'center', color: 'var(--color-danger)', margin: 0 }}>
              Transaction failed. Check console.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default SwapComponent;
