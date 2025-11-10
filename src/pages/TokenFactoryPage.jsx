import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Blocks,
  Code,
  Server,
  Workflow,
  Rocket,
  ShieldCheck,
  GitBranch,
  Globe,
} from 'lucide-react';
import useDeployContract from '../hooks/useDeployContract.js';

const workflowSteps = [
  {
    title: 'Define token architecture',
    description: 'Configure supply, burn mechanics, treasury splits, and governance parameters.',
    icon: Blocks,
  },
  {
    title: 'Provision infrastructure',
    description: 'Generate managed RPC endpoints, deployment wallets, and webhook listeners.',
    icon: Server,
  },
  {
    title: 'Launch with guardrails',
    description: 'Deploy audited contracts with liquidity locks, circuit breakers, and compliance toggles.',
    icon: ShieldCheck,
  },
  {
    title: 'Integrate programmatically',
    description: 'Use REST, WebSocket, and SDK tooling for automation, analytics, and treasury ops.',
    icon: Workflow,
  },
];

const integrationResources = [
  {
    title: 'REST API',
    description: 'Issue mint, burn, and treasury operations with full access control layers.',
    badge: 'REST v1',
    endpoint: 'https://api.wagydog.io/v1/',
  },
  {
    title: 'Webhook Automation',
    description: 'Receive streaming events for swaps, mints, staking rewards, and governance proposals.',
    badge: 'Webhooks',
    endpoint: 'https://api.wagydog.io/hooks',
  },
  {
    title: 'Socket Streams',
    description: 'Connect to real-time mempool insights, liquidity depth, and risk telemetry feeds.',
    badge: 'WebSocket',
    endpoint: 'wss://stream.wagydog.io/liquidity',
  },
];

const sdkDownloads = [
  {
    name: 'TypeScript SDK',
    version: '2.3.0',
    command: 'npm install @wagydog/sdk',
  },
  {
    name: 'Python SDK',
    version: '1.8.4',
    command: 'pip install wagydog-sdk',
  },
  {
    name: 'Go SDK',
    version: '0.10.2',
    command: 'go get github.com/wagydog/sdk',
  },
];

const TokenFactoryPage = () => {
  const { deploy, status, transactionHash, gasFeeDisplay, error, isLoading, isSuccess, reset } = useDeployContract();

  const handleDeploy = useCallback(async () => {
    try {
      await deploy();
    } catch (err) {
      console.warn('[TokenFactoryPage] Mock deployment failed', err);
    }
  }, [deploy]);

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
    <section
      className="surface-glass"
      style={{
        padding: 'clamp(2.5rem, 4vw, 3.5rem)',
        border: '1px solid rgba(124, 92, 255, 0.2)',
        display: 'grid',
        gap: '2rem',
        background: 'linear-gradient(135deg, rgba(10, 14, 28, 0.95), rgba(18, 24, 44, 0.92))',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge">WagyDog Token Launchpad</span>
          <h1 className="headline" style={{ fontSize: '2.6rem', marginTop: '1rem' }}>Deploy, control, and automate tokens on BNB Chain</h1>
          <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)', maxWidth: '60ch' }}>
            Enterprise-grade token factory for founders and developers. Launch memecoins with gated access controls, streaming emissions, and built-in compliance toggles.
          </p>
        </div>
        <Link to="/swap" className="button-secondary">
          Connect builder wallet
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="surface-glass" style={{ padding: '1.75rem', border: '1px solid rgba(124, 92, 255, 0.22)', display: 'grid', gap: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>Token creation blueprint</h2>
        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {workflowSteps.map((step) => (
            <article
              key={step.title}
              className="surface-glass"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(124, 92, 255, 0.18)',
                background: 'linear-gradient(150deg, rgba(16, 20, 36, 0.95), rgba(22, 26, 45, 0.92))',
                display: 'grid',
                gap: '0.75rem',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '15px',
                  border: '1px solid rgba(124, 92, 255, 0.22)',
                  background: 'rgba(124, 92, 255, 0.16)',
                }}
              >
                <step.icon size={20} />
              </span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>{step.title}</h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="surface-glass" style={{ padding: '2rem', border: '1px solid rgba(124, 92, 255, 0.18)', display: 'grid', gap: '1.5rem' }}>
      <header>
        <span className="chip">Deployment Console</span>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: '2.1rem', fontWeight: 600 }}>Configure token parameters</h2>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
          Every parameter below is audited for best practices. Liquidity locks and multisig controls enforced on deploy.
        </p>
      </header>
      <form style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Token Name</span>
          <input
            type="text"
            placeholder="WagyDog Prime"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Ticker Symbol</span>
          <input
            type="text"
            placeholder="WAGY"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Total Supply</span>
          <input
            type="number"
            placeholder="1,000,000,000"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Burn Rate (%)</span>
          <input
            type="number"
            placeholder="2.5"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Treasury Allocation (%)</span>
          <input
            type="number"
            placeholder="12"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Liquidity Lock Duration (days)</span>
          <input
            type="number"
            placeholder="180"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
          />
        </label>
      </form>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <button
            type="button"
            className="button-primary"
            style={{ justifySelf: 'start', minWidth: '220px', opacity: isLoading ? 0.7 : 1 }}
            onClick={handleDeploy}
            disabled={isLoading}
          >
            {isLoading ? 'Deploying…' : 'Deploy audited token contracts'}
            <Rocket size={16} />
          </button>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'grid', gap: '0.35rem' }}>
            <span>
              Status:{' '}
              <strong style={{ color: isSuccess ? 'var(--color-primary-accent)' : 'var(--color-text)' }}>
                {status === 'idle' ? 'Ready' : status === 'pending' ? 'Pending' : status === 'success' ? 'Success' : 'Error'}
              </strong>
            </span>
            <span>Estimated Gas: {gasFeeDisplay}</span>
            {transactionHash && (
              <span>
                Tx Hash:{' '}
                <code
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(9, 10, 18, 0.9)',
                    border: '1px solid rgba(124, 92, 255, 0.25)',
                  }}
                >
                  {transactionHash.substring(0, 12)}…
                </code>
              </span>
            )}
            {error && (
              <span style={{ color: 'var(--color-danger)' }}>
                {error.message}{' '}
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    marginLeft: '0.35rem',
                    background: 'transparent',
                    color: 'inherit',
                    border: 'none',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Reset
                </button>
              </span>
            )}
          </div>
        </div>
    </section>

    <section className="surface-glass" style={{ padding: '2rem', border: '1px solid rgba(124, 92, 255, 0.18)', display: 'grid', gap: '1.5rem' }} id="api">
      <header>
        <span className="chip">APIs & Streaming Infrastructure</span>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: '2rem', fontWeight: 600 }}>Automate lifecycle management with APIs, webhooks, and sockets</h2>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
          Each endpoint includes OAuth2 roles, rate limits, and audit logging. Integrate with DAO treasuries or trading desks seamlessly.
        </p>
      </header>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {integrationResources.map((resource) => (
          <article
            key={resource.title}
            className="surface-glass"
            style={{
              padding: '1.4rem',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              background: 'linear-gradient(150deg, rgba(16, 20, 36, 0.9), rgba(20, 24, 42, 0.9))',
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <span className="chip">{resource.badge}</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{resource.title}</h3>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>{resource.description}</p>
            <code
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                background: 'rgba(9, 10, 18, 0.9)',
                border: '1px solid rgba(124, 92, 255, 0.25)',
                fontSize: '0.82rem',
                color: '#cfd8ff',
              }}
            >
              {resource.endpoint}
            </code>
          </article>
        ))}
      </div>
    </section>

    <section className="surface-glass" style={{ padding: '2rem', border: '1px solid rgba(124, 92, 255, 0.18)', display: 'grid', gap: '1.5rem' }} id="sdk">
      <header>
        <span className="chip">Developer Tooling</span>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: '2rem', fontWeight: 600 }}>SDKs, docs, and governance integration</h2>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>
          Multi-language SDKs, CLI tooling, and GitHub templates accelerate deployment and monitoring.
        </p>
      </header>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {sdkDownloads.map((sdk) => (
          <article
            key={sdk.name}
            className="surface-glass"
            style={{
              padding: '1.4rem',
              border: '1px solid rgba(124, 92, 255, 0.18)',
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <span className="chip">{sdk.name}</span>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Current version: {sdk.version}</p>
            <code
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                background: 'rgba(9, 10, 18, 0.9)',
                border: '1px solid rgba(124, 92, 255, 0.25)',
                fontSize: '0.82rem',
                color: '#cfd8ff',
              }}
            >
              {sdk.command}
            </code>
            <Link to="/resources/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-accent)', fontWeight: 600 }}>
              View documentation
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
      <div className="surface-glass" style={{ padding: '1.35rem', border: '1px solid rgba(124, 92, 255, 0.2)', display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="chip">
            <Code size={14} />
            Open-source templates
          </span>
          <span className="chip">
            <GitBranch size={14} />
            Governance ready
          </span>
          <span className="chip">
            <Globe size={14} />
            Global compliance
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Access GitHub starter repositories, Hardhat automations, and DAO governance adapters to bring your token to production velocity.
        </p>
      </div>
    </section>
  </div>
  );
};

export default TokenFactoryPage;
