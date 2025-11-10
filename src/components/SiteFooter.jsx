import { Link } from 'react-router-dom';
import { Github, Twitter, Send, MessageCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';

const menuColumns = [
  {
    title: 'Protocol',
    links: [
      { label: 'Overview', href: '/' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Swap', href: '/swap' },
      { label: 'Liquidity Pools', href: '/pools' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Tokenomics', href: '/marketplace#tokenomics' },
      { label: 'Audit', href: '/resources/audit' },
      { label: 'Brand Assets', href: '/resources/brand' },
      { label: 'Press Kit', href: '/resources/press' },
    ],
  },
  {
    title: 'Build',
    links: [
      { label: 'Developer Docs', href: '/token-factory' },
      { label: 'API & Webhooks', href: '/token-factory#api' },
      { label: 'SDK Downloads', href: '/token-factory#sdk' },
      { label: 'Governance', href: '/pools?tab=governance' },
    ],
  },
];

const SiteFooter = () => (
  <footer
    style={{
      marginTop: 'auto',
      padding: '3.5rem clamp(1.5rem, 3vw, 3rem)',
      borderTop: '1px solid rgba(124, 92, 255, 0.18)',
      background: 'rgba(7, 9, 18, 0.92)',
    }}
  >
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gap: '3rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              height: '48px',
              width: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.25), rgba(75, 225, 195, 0.1))',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              boxShadow: '0 22px 28px -20px rgba(124, 92, 255, 0.8)',
            }}
          >
            <ShieldCheck size={22} />
          </span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.02em', color: 'var(--color-text)' }}>WagyDog Protocol</div>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: '32ch' }}>
              A mature DeFi stack for serious memecoin builders. Built on BNB Chain with institutional-grade infrastructure.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            <Twitter size={18} />
            <span>Twitter</span>
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            <Send size={18} />
            <span>Telegram</span>
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            <MessageCircle size={18} />
            <span>Discord</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {menuColumns.map((column) => (
          <div key={column.title} style={{ display: 'grid', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(152, 161, 192, 0.65)' }}>
              {column.title}
            </div>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--color-text)',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    padding: '0.35rem 0',
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(124, 92, 255, 0.12)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>© {new Date().getFullYear()} WagyDog Labs. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/compliance">Compliance</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
