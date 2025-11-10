import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import CardDashboard from '../components/CardDashboard.jsx';
import Carousel from '../components/Carousel.jsx';
import TrueFocus from '../components/TrueFocus.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Database, ShieldCheck, Waves } from 'lucide-react';
import { CONTRACT_ABI, CONTRACT_ADDRESS, BURN_ADDRESS } from '../config/blockchain.js';
import useLivePriceFeed from '../hooks/useLivePriceFeed.js';
import useLiquidityLocked from '../hooks/useLiquidityLocked.js';

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

const formatPriceMetric = (
  data,
  {
    decimals,
    isLoading,
    fallbackLabel = '≈ $0.00',
    bnbPriceUsd,
    wagyPriceUsd,
    formatUsd,
  },
) => {
  if (isLoading) return 'Loading…';

  const wagyUsdCandidate = typeof wagyPriceUsd === 'number' && Number.isFinite(wagyPriceUsd) ? wagyPriceUsd : null;
  const bnbUsdCandidate = typeof bnbPriceUsd === 'number' && Number.isFinite(bnbPriceUsd) ? bnbPriceUsd : null;

  let displayPrice = wagyUsdCandidate;

  if (displayPrice == null && data != null && bnbUsdCandidate != null) {
    const priceInBnb = Number.parseFloat(formatUnits(data, decimals));
    if (Number.isFinite(priceInBnb)) {
      const computedUsd = priceInBnb * bnbUsdCandidate;
      if (Number.isFinite(computedUsd)) {
        displayPrice = computedUsd;
      }
    }
  }

  if (displayPrice == null) return fallbackLabel;

  const formatter = typeof formatUsd === 'function'
    ? formatUsd(displayPrice, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(
        displayPrice,
      );

  return `≈ ${formatter}`;
};

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
  const {
    bnbPriceUsd,
    wagyPriceUsd,
    formattedBnbPrice,
    formattedWagyPrice,
    isLoading: isPriceLoading,
    formatUsd,
  } = useLivePriceFeed();
  const liquidityLocked = useLiquidityLocked();

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

  const liquidityMetricValue = useMemo(() => {
    if (liquidityLocked.isLoading) return 'Loading…';
    if (liquidityLocked.status === 'error') return 'Unavailable';
    if (liquidityLocked.formattedLockedUsd) return liquidityLocked.formattedLockedUsd;
    return '—';
  }, [liquidityLocked.formattedLockedUsd, liquidityLocked.isLoading, liquidityLocked.status]);

  const heroMetrics = useMemo(() => {
    const totalSupply = formatTokenMetric(totalSupplyQuery.data, {
      decimals: TOKEN_DECIMALS,
      suffix: 'WAGY',
      isLoading: totalSupplyQuery.isLoading,
      fractionDigits: 3,
    });

    const burnedTokens = formatTokenMetric(burnedSupplyQuery.data, {
      decimals: TOKEN_DECIMALS,
      suffix: 'WAGY',
      isLoading: burnedSupplyQuery.isLoading,
      fractionDigits: 3,
    });

    const marketPriceUsd = formatPriceMetric(mintPriceQuery.data, {
      decimals: BNB_DECIMALS,
      isLoading: mintPriceQuery.isLoading || isPriceLoading,
      formatUsd,
      bnbPriceUsd,
      wagyPriceUsd,
    });

    const marketPriceContext = (() => {
      if (isPriceLoading) return 'Fetching live prices…';

      const contextParts = [];

      if (formattedWagyPrice) {
        contextParts.push(`Proxy ≈ ${formattedWagyPrice}`);
      }

      if (formattedBnbPrice) {
        contextParts.push(`BNB ≈ ${formattedBnbPrice}`);
      }

      if (contextParts.length === 0) return '—';

      return contextParts.join(' • ');
    })();

    return [
      { label: 'Total Supply', value: totalSupply },
      { label: 'Tokens Burned', value: burnedTokens },
      {
        label: 'Market Price (USD)',
        value: marketPriceUsd,
        context: marketPriceContext,
      },
      { label: 'Liquidity Locked', value: liquidityMetricValue },
    ];
  }, [
    burnedSupplyQuery.data,
    burnedSupplyQuery.isLoading,
    bnbPriceUsd,
    formattedBnbPrice,
    formattedWagyPrice,
    isPriceLoading,
    liquidityMetricValue,
    mintPriceQuery.data,
    mintPriceQuery.isLoading,
    totalSupplyQuery.data,
    totalSupplyQuery.isLoading,
    wagyPriceUsd,
    formatUsd,
  ]);

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      <CardDashboard
        headingComponent={
          <h1 className="headline">
            <TrueFocus
              sentence="The dApp Stack The Wagydog Way"
              borderColor="#7c5cff"
              glowColor="rgba(124, 92, 255, 0.6)"
              animationDuration={0.4}
              pauseBetweenAnimations={1}
              blurAmount={6}
            />
          </h1>
        }
        subheading="WagyDog delivers enterprise-grade rails for community-led tokens with hyper-deflationary tokenomics and institutional liquidity."
        description="Deploy, trade, and govern from a single control surface. Built for founders, treasuries, and DeFi desks that demand security and performance."
        cta={{ label: 'Launch WagyDog dApp', href: '/swap' }}
        secondaryCta={{ label: 'View Whitepaper', href: '/resources/audit' }}
        metrics={heroMetrics}
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
