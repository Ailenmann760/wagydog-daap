import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet,
  LineChart,
  Users,
  Shield,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  BarChart3,
  CandlestickChart,
} from 'lucide-react';
import classNames from 'classnames';
import ConnectWalletButton from './ConnectWalletButton.jsx';

const ICON_MAP = {
  wallet: Wallet,
  lineChart: LineChart,
  users: Users,
  shield: Shield,
  terminal: CandlestickChart,
  analytics: BarChart3,
};

const CardNav = ({ brand, items, cta }) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isExternal = (href = '') => href.startsWith('http');

  return (
    <header
      className="surface"
      style={{
        borderRadius: '0 0 20px 20px',
        margin: '1.25rem auto 0',
        position: 'sticky',
        top: '0.75rem',
        zIndex: 20,
        maxWidth: 'min(1200px, 94vw)',
        background: 'rgba(10, 12, 25, 0.88)',
        border: '1px solid rgba(124, 92, 255, 0.25)',
        backdropFilter: 'blur(22px)',
        padding: '1rem clamp(1.25rem, 3vw, 2rem)',
      }}
    >
      <nav>
        <div className="nav-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <Link
            to="/"
            className="brand"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 700,
            }}
          >
            <div
              style={{
                height: '42px',
                width: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.35), rgba(75, 225, 195, 0.2))',
                border: '1px solid rgba(124, 92, 255, 0.3)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 16px 32px -18px rgba(124, 92, 255, 0.6)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(152, 161, 192, 0.9)' }}>{brand?.label}</div>
              <div style={{ fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>{brand?.name}</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="nav-toggle"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text)',
              position: 'relative',
              zIndex: 15,
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            className={classNames('nav-items', { open: mobileOpen })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              zIndex: mobileOpen ? 12 : 1,
            }}
          >
            {items?.map((item) => {
              const Icon = ICON_MAP[item.icon] || Shield;
              const isCardActive = activeItem === item.title;

              return (
                <div
                  key={item.title}
                  className={classNames('nav-item', { active: isCardActive })}
                  onMouseEnter={() => setActiveItem(item.title)}
                  onMouseLeave={() => setActiveItem(null)}
                  style={{ position: 'relative' }}
                >
                  <button
                    type="button"
                    className={classNames('nav-trigger', { active: isCardActive })}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      letterSpacing: '0.01em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon size={18} />
                    {item.title}
                  </button>

                  <div
                    className={classNames('nav-card', { visible: isCardActive })}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.75rem)',
                      left: '50%',
                      transform: 'translateX(-50%) translateY(12px)',
                      width: 'min(320px, 88vw)',
                      padding: '1.5rem',
                      borderRadius: '20px',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(124, 92, 255, 0.18)',
                      background: 'linear-gradient(160deg, rgba(10, 12, 24, 0.92), rgba(22, 25, 42, 0.92))',
                      boxShadow: '0 32px 64px -28px rgba(0, 0, 0, 0.55)',
                      opacity: isCardActive ? 1 : 0,
                      visibility: isCardActive ? 'visible' : 'hidden',
                      pointerEvents: isCardActive ? 'auto' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          height: '36px',
                          width: '36px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.3), rgba(75, 225, 195, 0.1))',
                          border: '1px solid rgba(124, 92, 255, 0.15)',
                        }}
                      >
                        <Icon size={18} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text)' }}>{item.title}</div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{item.description}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {item.links?.map((link) => {
                        const Component = isExternal(link.href) ? 'a' : Link;

                        return (
                          <Component
                            key={link.label}
                            to={!isExternal(link.href) ? link.href : undefined}
                            href={isExternal(link.href) ? link.href : undefined}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noreferrer noopener' : undefined}
                            onClick={() => setMobileOpen(false)}
                            className="nav-card-link"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: '12px',
                              background: 'linear-gradient(120deg, rgba(18, 20, 33, 0.85), rgba(26, 32, 55, 0.85))',
                              border: '1px solid rgba(124, 92, 255, 0.12)',
                              color: 'var(--color-text)',
                              fontWeight: 500,
                              transition: 'transform 0.2s ease, border 0.2s ease, background 0.2s ease',
                            }}
                          >
                            <span>{link.label}</span>
                            <ArrowRight size={16} />
                          </Component>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="nav-cta"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 15 }}
          >
            <Link
              to="/marketplace"
              className="nav-marketplace-link"
              style={{
                fontSize: '0.92rem',
                color: location.pathname === '/marketplace' ? 'var(--color-primary-accent)' : 'var(--color-text-muted)',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Marketplace
            </Link>
            <ConnectWalletButton
              label={cta?.label || 'Launch dApp'}
              connectedLabel={cta?.connectedLabel}
              className="nav-wallet-button"
              style={{
                borderRadius: '14px',
                padding: '0.65rem 1.25rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                boxShadow: '0 18px 32px -18px rgba(124, 92, 255, 0.75)',
              }}
              iconSize={18}
            />
          </div>
        </div>
      </nav>

      <style>
        {`
          @media (max-width: 960px) {
            .nav-toggle {
              display: block !important;
            }
            .nav-items {
              position: absolute;
              top: 100%;
              right: 1.5rem;
              left: 1.5rem;
              display: grid !important;
              gap: 1rem;
              padding: 1rem;
              margin-top: 1rem;
              border-radius: 16px;
              background: rgba(10, 12, 25, 0.95);
              border: 1px solid rgba(124, 92, 255, 0.2);
              transform-origin: top center;
              transform: scaleY(0);
              transition: transform 0.2s ease;
              pointer-events: none;
              opacity: 0;
            }
            .nav-items.open {
              transform: scaleY(1);
              pointer-events: auto;
              opacity: 1;
            }
            .nav-item .nav-card {
              display: none;
            }
            .nav-item .nav-trigger {
              justify-content: flex-start;
              width: 100%;
              border: 1px solid rgba(124, 92, 255, 0.18);
              background: rgba(18, 20, 33, 0.9) !important;
            }
            .nav-cta {
              margin-left: auto;
              display: inline-flex !important;
              align-items: center;
              gap: 0.5rem;
            }
            .nav-marketplace-link {
              display: none;
            }
            .nav-wallet-button {
              padding: 0.5rem !important;
              border-radius: 12px !important;
              min-width: 42px;
              box-shadow: none !important;
            }
            .nav-wallet-button svg {
              width: 20px;
              height: 20px;
            }
            .nav-wallet-button .connect-wallet-button__label {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              border: 0;
            }
          }
        `}
      </style>
    </header>
  );
};

export default CardNav;
