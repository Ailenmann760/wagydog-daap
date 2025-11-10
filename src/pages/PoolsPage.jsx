import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Coins, Layers, PiggyBank, ArrowUpRight, ShieldCheck } from 'lucide-react';

const poolDefinitions = [
  {
    category: 'staking',
    title: 'Validator Staking Pools',
    description: 'Bond WAGY to validator clusters and earn protocol-level emissions with dynamic reward curves.',
    icon: Coins,
    pools: [
      {
        name: 'Prime Validator Pool',
        tvl: '$32.8M',
        apr: '21.4%',
        lockup: '14 days',
        risk: 'Low',
      },
      {
        name: 'Community Delegation Pool',
        tvl: '$8.6M',
        apr: '15.2%',
        lockup: '7 days',
        risk: 'Low',
      },
    ],
  },
  {
    category: 'farming',
    title: 'Liquidity Farming Vaults',
    description: 'Deploy capital across curated LPs with impermanent loss hedging and streaming incentives.',
    icon: Layers,
    pools: [
      {
        name: 'WAGY / BNB v3 Managed',
        tvl: '$18.2M',
        apr: '32.9%',
        lockup: 'Flexible',
        risk: 'Medium',
      },
      {
        name: 'WAGY / USDT Delta-Neutral',
        tvl: '$11.4M',
        apr: '27.6%',
        lockup: '30 days',
        risk: 'Medium',
      },
    ],
  },
  {
    category: 'lending',
    title: 'Credit & Lending Markets',
    description: 'Institutional-grade credit lines with oracle-verified collateral baskets and automated margin calls.',
    icon: PiggyBank,
    pools: [
      {
        name: 'Institutional Credit Tranche',
        tvl: '$24.3M',
        apr: '9.4%',
        lockup: 'Flexible',
        risk: 'Low',
      },
      {
        name: 'DAO Treasury Credit',
        tvl: '$6.8M',
        apr: '11.2%',
        lockup: 'Flexible',
        risk: 'Low',
      },
    ],
  },
];

const PoolsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'staking';
  const [activeCategory, setActiveCategory] = useState(initialTab);

  const activeDefinition = useMemo(
    () => poolDefinitions.find((definition) => definition.category === activeCategory) ?? poolDefinitions[0],
    [activeCategory],
  );

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      <section className="surface-glass" style={{ padding: 'clamp(2.4rem, 4vw, 3.5rem)', border: '1px solid rgba(124, 92, 255, 0.2)', display: 'grid', gap: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="badge">Liquidity & Credit Pools</span>
            <h1 className="headline" style={{ fontSize: '2.45rem', marginTop: '1rem' }}>Deploy capital across staking, farming, and credit rails</h1>
            <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)', maxWidth: '62ch' }}>
              Curated pools run by WagyDog DAO and ecosystem partners offering insured yield strategies with real-time risk telemetry.
            </p>
          </div>
          <Link to="/token-factory" className="button-secondary">
            Launch managed pool
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {poolDefinitions.map((definition) => {
            const Icon = definition.icon;
            const isActive = definition.category === activeCategory;
            return (
              <button
                type="button"
                key={definition.category}
                onClick={() => setActiveCategory(definition.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem 1.35rem',
                  borderRadius: '16px',
                  border: `1px solid rgba(124, 92, 255, ${isActive ? '0.45' : '0.18'})`,
                  background: isActive ? 'rgba(124, 92, 255, 0.16)' : 'rgba(16, 20, 40, 0.65)',
                  color: '#fff',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                <Icon size={18} />
                <span style={{ textTransform: 'capitalize' }}>{definition.category}</span>
              </button>
            );
          })}
        </div>

        <div className="surface-glass" style={{ padding: '1.75rem', border: '1px solid rgba(124, 92, 255, 0.18)', display: 'grid', gap: '1.25rem' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>{activeDefinition.title}</h2>
              <p style={{ margin: '0.65rem 0 0', color: 'var(--color-text-muted)' }}>{activeDefinition.description}</p>
            </div>
            <Link to="/swap" className="button-secondary">
              Manage liquidity
              <ArrowRight size={16} />
            </Link>
          </header>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {activeDefinition.pools.map((pool) => (
              <article
                key={pool.name}
                className="surface-glass"
                style={{
                  padding: '1.35rem',
                  border: '1px solid rgba(124, 92, 255, 0.18)',
                  background: 'linear-gradient(145deg, rgba(16, 20, 34, 0.92), rgba(24, 28, 46, 0.92))',
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{pool.name}</h3>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Risk rating: {pool.risk}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>TVL</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{pool.tvl}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Projected APR</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{pool.apr}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Lockup</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{pool.lockup}</p>
                </div>
                <Link to={`/pools/${activeDefinition.category}/${pool.name.toLowerCase().replace(/\s+/g, '-')}`} style={{ justifySelf: 'end', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-accent)', fontWeight: 600 }}>
                  View strategy
                  <ArrowUpRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-glass" style={{ padding: '2rem', border: '1px solid rgba(124, 92, 255, 0.18)', display: 'grid', gap: '1.5rem' }}>
        <header>
          <span className="chip">Risk & Compliance Framework</span>
          <h2 style={{ margin: '0.75rem 0 0', fontSize: '2rem', fontWeight: 600 }}>Every pool undergoes continuous risk scoring and coverage</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
            WagyDog’s risk engine streams collateralization, counter-party, and governance signals to protect capital allocations.
          </p>
        </header>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="surface-glass" style={{ padding: '1.25rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <ShieldCheck size={18} />
            <h3 style={{ margin: '0.65rem 0 0' }}>Insurance Coverage</h3>
            <p style={{ margin: '0.45rem 0 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
              DAO-backed insurance pools cover validator downtime and smart contract risk up to $25M per incident.
            </p>
          </div>
          <div className="surface-glass" style={{ padding: '1.25rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <Layers size={18} />
            <h3 style={{ margin: '0.65rem 0 0' }}>Dynamic Guardrails</h3>
            <p style={{ margin: '0.45rem 0 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
              Automated guardrails throttle exposures when volatility, utilization, or oracle variance cross thresholds.
            </p>
          </div>
          <div className="surface-glass" style={{ padding: '1.25rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
            <PiggyBank size={18} />
            <h3 style={{ margin: '0.65rem 0 0' }}>Transparent Yield</h3>
            <p style={{ margin: '0.45rem 0 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
              Real-time dashboards illustrate how yield is generated across validators, LP fees, and external credit lines.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PoolsPage;
