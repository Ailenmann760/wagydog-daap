import { ArrowRight, BarChart3, CircleDollarSign, GalleryVertical, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredCollections = [
  {
    name: 'WAGY Genesis',
    descriptor: 'Protocol Founders Series',
    floor: '12.4 BNB',
    volume: '4,892 BNB',
    listed: 184,
    badge: 'Genesis',
    accent: '#7c5cff',
  },
  {
    name: 'Validator Syndicate',
    descriptor: 'Validator Reward Nodes',
    floor: '8.2 BNB',
    volume: '3,421 BNB',
    listed: 97,
    badge: 'Validator',
    accent: '#4be1c3',
  },
  {
    name: 'Liquidity Architects',
    descriptor: 'Market Making NFTs',
    floor: '4.7 BNB',
    volume: '2,189 BNB',
    listed: 212,
    badge: 'Liquidity',
    accent: '#5b8fff',
  },
];

const liveListings = [
  {
    title: 'Alpha Vault Node',
    price: '3.6 BNB',
    apr: '21.4%',
    seller: '0x83d5...ad02',
    time: 'Live · 4m',
  },
  {
    title: 'Treasury Split Pass',
    price: '5.1 BNB',
    apr: '18.2%',
    seller: '0x9f12...b784',
    time: 'Live · 12m',
  },
  {
    title: 'WAGY Council Seat',
    price: '9.8 BNB',
    apr: 'Governance',
    seller: '0x24f9...cc78',
    time: 'Live · 19m',
  },
];

const complianceHighlights = [
  'Full on-chain provenance tracking',
  'Escrow and dispute resolution framework',
  'SOC2-ready custody integrations',
];

const MarketplacePage = () => (
  <div style={{ display: 'grid', gap: '3rem' }}>
    <section
      className="surface-glass"
      style={{
        padding: 'clamp(2.5rem, 4vw, 3.75rem)',
        display: 'grid',
        gap: '2rem',
        border: '1px solid rgba(124, 92, 255, 0.18)',
        background: 'linear-gradient(125deg, rgba(10, 14, 28, 0.96), rgba(16, 24, 48, 0.92))',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge">NFT Marketplace</span>
          <h1 className="headline" style={{ fontSize: '2.4rem', marginTop: '1rem' }}>
            Institutional-grade NFT trading for the WagyDog ecosystem
          </h1>
          <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)', maxWidth: '60ch' }}>
            Curated liquidity for staking nodes, governance seats, and protocol infrastructure NFTs. Executed via audited smart
            contracts with advanced settlement protection.
          </p>
        </div>
        <Link to="/swap" className="button-primary">
          Enter Trading Desk
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="surface-glass" style={{ padding: '1.5rem', borderColor: 'rgba(124, 92, 255, 0.26)' }}>
          <CircleDollarSign size={18} style={{ color: '#7c5cff' }} />
          <h3 style={{ margin: '0.75rem 0 0', fontSize: '1rem', color: 'var(--color-text-muted)' }}>24h Volume</h3>
          <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>$1.4M</p>
        </div>
        <div className="surface-glass" style={{ padding: '1.5rem', borderColor: 'rgba(124, 92, 255, 0.26)' }}>
          <BarChart3 size={18} style={{ color: '#4be1c3' }} />
          <h3 style={{ margin: '0.75rem 0 0', fontSize: '1rem', color: 'var(--color-text-muted)' }}>Liquidity Depth</h3>
          <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>$8.9M</p>
        </div>
        <div className="surface-glass" style={{ padding: '1.5rem', borderColor: 'rgba(124, 92, 255, 0.26)' }}>
          <ShieldCheck size={18} style={{ color: '#5b8fff' }} />
          <h3 style={{ margin: '0.75rem 0 0', fontSize: '1rem', color: 'var(--color-text-muted)' }}>Settlement Protection</h3>
          <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>99.99%</p>
        </div>
        <div className="surface-glass" style={{ padding: '1.5rem', borderColor: 'rgba(124, 92, 255, 0.26)' }}>
          <GalleryVertical size={18} style={{ color: '#f7a6ff' }} />
          <h3 style={{ margin: '0.75rem 0 0', fontSize: '1rem', color: 'var(--color-text-muted)' }}>Collections Onboarded</h3>
          <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>38</p>
        </div>
      </div>
    </section>

    <section className="grid" style={{ gap: '2rem' }}>
      <header>
        <span className="chip">Featured Collections</span>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: '2rem', fontWeight: 600 }}>Liquidity-backed NFT vaults</h2>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
          Strategic vaults with real yield and verifiable on-chain performance.
        </p>
      </header>
      <div className="card-grid">
        {featuredCollections.map((collection) => (
          <article
            key={collection.name}
            className="surface-glass"
            style={{
              padding: '1.8rem',
              border: `1px solid ${collection.accent}33`,
              background: `linear-gradient(150deg, rgba(16, 18, 32, 0.93), ${collection.accent}10)`,
              display: 'grid',
              gap: '0.85rem',
            }}
          >
            <span className="chip" style={{ background: `${collection.accent}22`, borderColor: `${collection.accent}44` }}>
              {collection.badge}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>{collection.name}</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>{collection.descriptor}</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Floor</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{collection.floor}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>24h Volume</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{collection.volume}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Listings</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{collection.listed}</p>
              </div>
            </div>
            <Link
              to={`/marketplace/${collection.name.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', color: 'var(--color-primary-accent)', fontWeight: 600 }}
            >
              View Vault
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>

    <section
      className="surface-glass"
      style={{
        padding: '2rem',
        border: '1px solid rgba(124, 92, 255, 0.18)',
        background: 'linear-gradient(135deg, rgba(16, 20, 38, 0.92), rgba(24, 30, 52, 0.92))',
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="chip">Live Order Flow</span>
          <h2 style={{ margin: '0.75rem 0 0', fontSize: '1.85rem', fontWeight: 600 }}>High-value listings streaming from protocol desks</h2>
        </div>
        <Link to="/marketplace/orderbook" className="button-secondary">
          Open Order Book
          <ArrowRight size={16} />
        </Link>
      </header>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {liveListings.map((listing) => (
          <article
            key={listing.title}
            className="surface-glass"
            style={{
              padding: '1.35rem',
              border: '1px solid rgba(124, 92, 255, 0.18)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{listing.title}</h3>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{listing.seller}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Price</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{listing.price}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>APR</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{listing.apr}</p>
            </div>
            <div style={{ justifySelf: 'end', textAlign: 'right' }}>
              <span className="chip" style={{ background: 'rgba(124, 92, 255, 0.18)' }}>
                {listing.time}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="surface-glass" style={{ padding: '2rem', border: '1px solid rgba(124, 92, 255, 0.16)', display: 'grid', gap: '1.25rem' }}>
      <header>
        <span className="chip">Compliance + Protection</span>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: '1.8rem', fontWeight: 600 }}>Institutional safeguards baked into every trade</h2>
      </header>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {complianceHighlights.map((line) => (
          <p key={line} style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            ✓ {line}
          </p>
        ))}
      </div>
      <Link to="/resources/audit" className="button-secondary" style={{ justifySelf: 'start' }}>
        Review compliance documentation
        <ArrowRight size={16} />
      </Link>
    </section>
  </div>
);

export default MarketplacePage;
