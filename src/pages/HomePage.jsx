import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import CardSwap from '../components/CardSwap.jsx';
import Carousel from '../components/Carousel.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Database, ShieldCheck, Waves } from 'lucide-react';
import { CONTRACT_ABI, CONTRACT_ADDRESS, BURN_ADDRESS } from '../config/blockchain.js';
import useLivePriceFeed from '../hooks/useLivePriceFeed.js';

const logContractReadError = (context, method) => (error) => {
  console.warn(`[${context}] Failed to read ${method}. Verify contract configuration in config/blockchain.js`, error);
};

const TOKEN_DECIMALS = 18;
const BNB_DECIMALS = 18;

const formatCompact = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
  }).format(value);

const formatTokenMetric = (data, { decimals, suffix, isLoading, fallbackLabel = '—', fractionDigits = 2 }) => {
  if (isLoading) return 'Loading…';
  if (data == null) return fallbackLabel;

  const normalized = Number.parseFloat(formatUnits(data, decimals));
  if (!Number.isFinite(normalized)) return fallbackLabel;

  return `${formatCompact(normalized, fractionDigits)}${suffix ? ` ${suffix}` : ''}`;
};

const formatPriceMetric = (data, { decimals, isLoading, fallbackLabel = '≈ 0.00 USD', formatUsd }) => {
  if (isLoading) return 'Loading…';
  if (data == null) return fallbackLabel;

  const priceInBnb = Number.parseFloat(formatUnits(data, decimals));
  if (!Number.isFinite(priceInBnb)) return fallbackLabel;

  if (typeof formatUsd === 'function') {
    const priceInUsd = formatUsd(priceInBnb);
    if (Number.isFinite(priceInUsd)) {
      return `≈ ${priceInUsd.toFixed(2)} USD`;
    }
  }

  return fallbackLabel;
};

const heroCards = [
  {
    title: 'Hyper-Deflationary',
    description: 'Smart-burn mechanics and real-time liquidity routing maintain perpetual scarcity.',
    icon: 'flame',
    badge: 'Tokenomics v2',
  },
  {
    title: 'Secured & Audited',
    description: 'Independent audits, live on-chain monitoring, and automated circuit breakers.',
    icon: 'shield',
    badge: 'Audit Ready',
  },
  {
    title: 'Community Governance',
    description: 'Delegated voting and proposal streaming keep token holders in the driver’s seat.',
    icon: 'governance',
  },
  {
    title: 'dApp Utility',
    description: 'Native staking, farming, and credit markets built for meme coin velocity.',
    icon: 'utility',
  },
];

const carouselItems = [
  {
    title: 'Token Swap',
    description: 'Institutional-grade routing across BNB DEX venues with zero-code execution.',
    icon: 'swap',
    meta: ['Cross-DEX', 'Slippage Guard'],
  },
  {
    title: 'High APY Staking',
    description: 'Bonded validator delegation and auto-compound strategies for serious earners.',
    icon: 'staking',
    meta: ['Auto-Compound', 'Validator Alliance'],
  },
  {
    title: 'Liquidity Pool',
    description: 'Delta-neutral pools with managed impermanent loss coverage.',
    icon: 'liquidity',
    meta: ['IL Protection', 'Vault Hedging'],
  },
  {
    title: 'Mobile Ready',
    description: 'Wallet-first interface optimized for mobile DeFi flows and biometric security.',
    icon: 'mobile',
    meta: ['Biometric', 'Native Wallets'],
  },
  {
    title: 'Vast Community',
    description: '12k+ governors and node runners powering the WagyDog economic flywheel.',
    icon: 'community',
    meta: ['Governance', 'Treasury'],
  },
];

const spotlightBlocks = [
  {
    title: 'Deep Liquidity Routing',
    copy: 'Multi-hop routing with real-time gas optimization ensures best execution across BNB DEX liquidity venues.',
    icon: Waves,
    link: { href: '/swap', label: 'Access Swap' },
  },
  {
    title: 'Compliance-Grade Security',
    copy: 'Enterprise custodial tooling, hardware signer support, and SOC2-ready operations unlock institutional adoption.',
    icon: ShieldCheck,
    link: { href: '/resources/audit', label: 'View Audit' },
  },
  {
    title: 'Developer-Ready Toolkit',
    copy: 'Webhook orchestration, SDKs, and managed RPC nodes streamline smart contract deployment on BNB Chain.',
    icon: Cpu,
    link: { href: '/token-factory', label: 'Launch Tokens' },
  },
  {
    title: 'Data Lake + Insights',
    copy: 'Query live mempool analytics, treasury flows, and staking telemetry via our streaming data infrastructure.',
    icon: Database,
    link: { href: '/marketplace#analytics', label: 'Explore Insights' },
  },
];

const HomePage = () => {
  const { formatBnbToUsd } = useLivePriceFeed();

  const totalSupplyQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
    query: {
      staleTime: 60_000,
      refetchInterval: 120_000,
      onError: logContractReadError('HomePage', 'totalSupply'),
    },
  });

  const burnedSupplyQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [BURN_ADDRESS],
    query: {
      staleTime: 90_000,
      refetchInterval: 180_000,
      onError: logContractReadError('HomePage', 'balanceOf burn address'),
    },
  });

  const mintPriceQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'MINT_PRICE',
    query: {
      staleTime: 90_000,
      refetchInterval: 180_000,
      onError: logContractReadError('HomePage', 'MINT_PRICE'),
    },
  });

  const heroMetrics = useMemo(
    () => [
      {
        label: 'Total Supply',
        value: formatTokenMetric(totalSupplyQuery.data, {
          decimals: TOKEN_DECIMALS,
          suffix: 'WAGY',
          isLoading: totalSupplyQuery.isLoading,
          fractionDigits: 3,
        }),
      },
      {
        label: 'Tokens Burned',
        value: formatTokenMetric(burnedSupplyQuery.data, {
          decimals: TOKEN_DECIMALS,
          suffix: 'WAGY',
          isLoading: burnedSupplyQuery.isLoading,
          fractionDigits: 3,
        }),
      },
      {
        label: 'Market Price (USD)',
        value: formatPriceMetric(mintPriceQuery.data, {
          decimals: BNB_DECIMALS,
          isLoading: mintPriceQuery.isLoading,
          formatUsd: formatBnbToUsd,
        }),
      },
      {
        label: 'Liquidity Locked',
        value: 'Coming soon',
      },
    ],
    [
      burnedSupplyQuery.data,
      burnedSupplyQuery.isLoading,
      mintPriceQuery.data,
      mintPriceQuery.isLoading,
      formatBnbToUsd,
      totalSupplyQuery.data,
      totalSupplyQuery.isLoading,
    ],
  );

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      <CardSwap
        heading="The serious dApp stack for memecoin dominance"
        subheading="WagyDog delivers enterprise-grade rails for community-led tokens with hyper-deflationary tokenomics and institutional liquidity."
        description="Deploy, trade, and govern from a single control surface. Built for founders, treasuries, and DeFi desks that demand security and performance."
        cta={{ label: 'Launch WagyDog dApp', href: '/swap' }}
        secondaryCta={{ label: 'View Whitepaper', href: '/resources/audit' }}
        metrics={heroMetrics}
        cards={heroCards}
        cardWidth={240}
        cardHeight={156}
        cardGap={24}
      />

      <section className="grid" style={{ gap: '2rem' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span className="chip">WagyDog Ecosystem</span>
          <h2 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 600 }}>End-to-end infrastructure for tokenized communities</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: '60ch' }}>
            From on-chain liquidity to DAO operations, every module in WagyDog is orchestrated for real-time markets and measurable outcomes.
          </p>
        </header>

        <div className="card-grid">
          {spotlightBlocks.map((block) => (
            <article
              key={block.title}
              className="surface-glass"
              style={{
                padding: '1.75rem',
                border: '1px solid rgba(124, 92, 255, 0.16)',
                background: 'linear-gradient(160deg, rgba(16, 18, 32, 0.92), rgba(26, 32, 54, 0.92))',
                display: 'grid',
                gap: '1rem',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(124, 92, 255, 0.16)',
                  border: '1px solid rgba(124, 92, 255, 0.26)',
                  color: '#a899ff',
                }}
              >
                <block.icon size={20} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{block.title}</h3>
                <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{block.copy}</p>
              </div>
              <Link
                to={block.link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-accent)',
                }}
              >
                {block.link.label}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <Carousel items={carouselItems} autoplay pauseOnHover />
    </div>
  );
};

export default HomePage;
