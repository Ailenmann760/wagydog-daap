import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { ArrowRight, Loader } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/blockchain.js';

const SwapComponent = () => {
  const { isConnected } = useAccount();
  const [bnbAmount, setBnbAmount] = useState('0.1');
  const { writeContract, isPending, isSuccess, isError } = useWriteContract();

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

  const estimatedWagy = Number.parseFloat(bnbAmount || '0') * 50000000;

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
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              ~{Number.isFinite(estimatedWagy) ? estimatedWagy.toLocaleString() : '0.0'} WAGY (Estimate)
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
