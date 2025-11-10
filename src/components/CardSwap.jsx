import { Link } from 'react-router-dom';
import {
  Flame,
  ShieldCheck,
  Users2,
  Layers,
  ArrowRight,
  BarChart4,
  Workflow,
} from 'lucide-react';
import ConnectWalletButton from './ConnectWalletButton.jsx';

const ICON_MAP = {
  flame: Flame,
  shield: ShieldCheck,
  governance: Users2,
  utility: Layers,
  analytics: BarChart4,
  automation: Workflow,
};

const CardSwap = ({
  label = 'WagyDog Advantage',
  heading,
  subheading,
  description,
  cta,
  secondaryCta,
  metrics = [],
  cards = [],
  cardWidth = 260,
  cardHeight = 160,
  cardGap = 28,
}) => (
  <section
    className="surface-glass"
    style={{
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(2.25rem, 4vw, 3.75rem)',
      background: 'linear-gradient(135deg, rgba(9, 12, 28, 0.95), rgba(16, 24, 52, 0.9))',
      border: '1px solid rgba(124, 92, 255, 0.2)',
      boxShadow: '0 48px 120px -60px rgba(0, 0, 0, 0.85)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 10% 0%, rgba(124, 92, 255, 0.18), transparent 45%)',
        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ flex: '1 1 320px', maxWidth: '520px', display: 'grid', gap: '1.5rem' }}>
        {label && (
          <span className="badge" style={{ width: 'fit-content' }}>
            {label}
          </span>
        )}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {heading && <h1 className="headline">{heading}</h1>}
          {subheading && (
            <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '46ch' }}>{subheading}</p>
          )}
          {description && (
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(200, 205, 230, 0.8)', maxWidth: '48ch' }}>{description}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {cta && (
            <ConnectWalletButton
              label={cta.label}
              style={{ padding: '0.85rem 1.4rem' }}
            />
          )}
          {secondaryCta && (
            <Link to={secondaryCta.href} className="button-secondary">
              {secondaryCta.label}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="metric-grid">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                style={{
                  border: '1px solid rgba(124, 92, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '1.1rem',
                  background: 'rgba(12, 16, 30, 0.75)',
                  display: 'grid',
                  gap: '0.45rem',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '1.35rem', fontWeight: 700 }}>{metric.value}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{metric.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          flex: '1 1 320px',
          minWidth: '320px',
          display: 'grid',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 'fit-content',
            margin: '0 auto',
            perspective: '1400px',
            transformStyle: 'preserve-3d',
          }}
        >
          {cards.map((card, index) => {
            const Icon = ICON_MAP[card.icon] || Layers;

            return (
              <div
                key={card.title}
                style={{
                  position: 'relative',
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  padding: '1.4rem',
                  borderRadius: '18px',
                  background: 'linear-gradient(165deg, rgba(18, 22, 36, 0.92), rgba(36, 40, 68, 0.92))',
                  border: '1px solid rgba(124, 92, 255, 0.18)',
                  boxShadow: '0 30px 40px -32px rgba(124, 92, 255, 0.5)',
                  backdropFilter: 'blur(24px)',
                  transform: `translate(${(index % 2) * (cardWidth / 1.8)}px, ${
                    Math.floor(index / 2) * (cardHeight / 1.5)
                  }px) rotateX(0deg) rotateY(${index % 2 === 0 ? '-6deg' : '6deg'})`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  marginBottom: `${cardGap}px`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      height: '40px',
                      width: '40px',
                      borderRadius: '14px',
                      background: 'rgba(124, 92, 255, 0.18)',
                      border: '1px solid rgba(124, 92, 255, 0.22)',
                      color: '#a899ff',
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  {card.badge && (
                    <span className="chip" style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '1.1rem', display: 'grid', gap: '0.55rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{card.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default CardSwap;
