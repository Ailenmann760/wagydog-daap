import { useState } from 'react';
import { ArrowDownUp, ArrowRight, ShieldCheck, Sparkle, Settings, LineChart, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const routeProfiles = [
  {
    title: 'Single-Hop Execution',
    description: 'Direct liquidity routes across PancakeSwap v3 with quality-of-service guarantees.',
    metrics: ['Latency < 850ms', 'Gas optimized'],
  },
  {
    title: 'Multi-Route Blending',
    description: 'Route splitting across multiple venues to minimize price impact for large orders.',
    metrics: ['Max impact 0.23%', 'Auto rebalances'],
  },
  {
    title: 'Limit & TWAP Orders',
    description: 'Programmatic execution with on-chain settlement and unstoppable price bands.',
    metrics: ['Price band guard', 'DAO-approved'],
  },
];

const swapTokens = [
  { symbol: 'WAGY', name: 'WagyDog Token', balance: '182,394.21', fiat: '$68,320' },
  { symbol: 'BNB', name: 'Binance Coin', balance: '32.14', fiat: '$14,920' },
  { symbol: 'USDT', name: 'Tether USD', balance: '64,210.00', fiat: '$64,210' },
];

const SwapPage = () => {
  const [fromToken, setFromToken] = useState(swapTokens[0]);
  const [toToken, setToToken] = useState(swapTokens[1]);

  const handleFlipTokens = () => {
    const previousFrom = fromToken;
    setFromToken(toToken);
    setToToken(previousFrom);
  };

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      <section
        className="surface-glass"
        style={{
          padding: 'clamp(2.5rem, 4vw, 3.5rem)',
          display: 'grid',
          gap: '2.5rem',
          border: '1px solid rgba(124, 92, 255, 0.2)',
          background: 'linear-gradient(140deg, rgba(10, 14, 28, 0.95), rgba(16, 22, 44, 0.92))',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="badge">WagyDog Swap Desk</span>
            <h1 className="headline" style={{ fontSize: '2.5rem', marginTop: '1rem' }}>
              Execute trades across BNB Chain with institutional routing
            </h1>
            <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)', maxWidth: '60ch' }}>
              Enterprise-grade aggregation engine spanning PancakeSwap, Biswap, and lithium pools with real-time slippage
              protection and settlement insurance.
            </p>
          </div>
          <Link to="/token-factory" className="button-secondary">
            Launch new asset
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div
            className="surface-glass"
            style={{
              padding: '1.8rem',
              border: '1px solid rgba(124, 92, 255, 0.24)',
              background: 'linear-gradient(155deg, rgba(16, 20, 38, 0.95), rgba(26, 32, 58, 0.92))',
              display: 'grid',
              gap: '1.5rem',
            }}
          >
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Swap Engine</span>
                <h2 style={{ margin: '0.4rem 0 0' }}>Institutional order flow</h2>
              </div>
              <button
                type="button"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  border: '1px solid rgba(124, 92, 255, 0.2)',
                  background: 'rgba(16, 20, 38, 0.85)',
                  color: '#fff',
                }}
              >
                <Settings size={17} />
              </button>
            </header>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div
                className="surface-glass"
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(124, 92, 255, 0.18)',
                  display: 'grid',
                  gap: '0.8rem',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>From</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{fromToken.symbol}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{fromToken.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{fromToken.balance}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{fromToken.fiat}</span>
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleFlipTokens}
                  style={{
                    borderRadius: '14px',
                    border: '1px solid rgba(124, 92, 255, 0.2)',
                    background: 'rgba(16, 20, 38, 0.85)',
                    display: 'grid',
                    placeItems: 'center',
                    width: '46px',
                    height: '46px',
                    color: '#fff',
                  }}
                >
                  <ArrowDownUp size={18} />
                </button>
              </div>

              <div
                className="surface-glass"
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(124, 92, 255, 0.18)',
                  display: 'grid',
                  gap: '0.8rem',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>To</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{toToken.symbol}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{toToken.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{toToken.balance}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{toToken.fiat}</span>
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Route: PancakeSwap v3 → Biswap → Internal Pools</span>
                <span>Expected rate: 1 BNB ≈ 145,342 WAGY</span>
              </div>

              <button className="button-primary" type="button" style={{ justifyContent: 'center' }}>
                Connect institutional wallet
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="chip" style={{ background: 'rgba(75, 225, 195, 0.16)' }}>
                <Sparkle size={14} />
                Slippage guard 0.5%
              </span>
              <span className="chip" style={{ background: 'rgba(124, 92, 255, 0.16)' }}>
                <ShieldCheck size={14} />
                Settlement insured
              </span>
            </div>
          </div>

          <div className="surface-glass" style={{ padding: '1.75rem', display: 'grid', gap: '1.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>Routing profiles</h2>
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              {routeProfiles.map((route) => (
                <article
                  key={route.title}
                  className="surface-glass"
                  style={{
                    padding: '1.25rem',
                    border: '1px solid rgba(124, 92, 255, 0.18)',
                    background: 'linear-gradient(150deg, rgba(16, 20, 38, 0.9), rgba(22, 26, 44, 0.9))',
                    display: 'grid',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Zap size={18} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{route.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>{route.description}</p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {route.metrics.map((metric) => (
                      <span
                        key={metric}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '999px',
                          border: '1px solid rgba(124, 92, 255, 0.22)',
                          background: 'rgba(124, 92, 255, 0.12)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <Link to="/pools" className="button-secondary" style={{ justifySelf: 'start' }}>
              Configure liquidity profile
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="surface-glass" style={{ padding: '2rem', border: '1px solid rgba(124, 92, 255, 0.18)', display: 'grid', gap: '1.5rem' }}>
        <header>
          <span className="chip">Execution Intelligence</span>
          <h2 style={{ margin: '0.75rem 0 0', fontSize: '2rem', fontWeight: 600 }}>Live risk telemetry and performance analytics</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
            Monitor on-chain risk signals, gas volatility, and mempool spreads before dispatching size.
          </p>
        </header>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="surface-glass" style={{ padding: '1.25rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <Activity size={18} />
            <h3 style={{ margin: '0.75rem 0 0' }}>Risk score</h3>
            <p style={{ margin: '0.4rem 0 0', fontSize: '1.35rem', fontWeight: 700 }}>Low · 0.12</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>24h volatility guard active</span>
          </div>
          <div className="surface-glass" style={{ padding: '1.25rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <LineChart size={18} />
            <h3 style={{ margin: '0.75rem 0 0' }}>Performance</h3>
            <p style={{ margin: '0.4rem 0 0', fontSize: '1.35rem', fontWeight: 700 }}>+12.4% vs market</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Routing alpha YTD</span>
          </div>
          <div className="surface-glass" style={{ padding: '1.25rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <ShieldCheck size={18} />
            <h3 style={{ margin: '0.75rem 0 0' }}>Settlement assurance</h3>
            <p style={{ margin: '0.4rem 0 0', fontSize: '1.35rem', fontWeight: 700 }}>99.99% uptime</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Insurance pool live</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SwapPage;
