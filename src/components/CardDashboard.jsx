import { useEffect, useState } from 'react';
import ConnectWalletButton from './ConnectWalletButton.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Cubes from './Cubes.jsx';

const CardDashboard = ({
  label,
  heading,
  headingComponent,
  subheading,
  description,
  metrics = [],
  cta,
  secondaryCta,
}) => {
  const [showCubes, setShowCubes] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth >= 992;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setShowCubes(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      className="surface-glass"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(2.25rem, 4vw, 3.5rem)',
        background: 'linear-gradient(135deg, rgba(9, 12, 28, 0.95), rgba(16, 24, 52, 0.9))',
        border: '1px solid rgba(124, 92, 255, 0.2)',
        boxShadow: '0 48px 120px -60px rgba(0, 0, 0, 0.85)',
        display: 'grid',
        gap: '2.5rem',
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
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gap: '2rem',
        }}
      >
        <div className="hero-presentation">
          <div className="hero-presentation__content">
            {label && (
              <span className="badge" style={{ width: 'fit-content' }}>
                {label}
              </span>
            )}
            {headingComponent ? (
              headingComponent
            ) : (
              heading && <h1 className="headline">{heading}</h1>
            )}
            {subheading && (
              <p
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: 'var(--color-text-muted)',
                  maxWidth: '58ch',
                }}
              >
                {subheading}
              </p>
            )}
            {description && (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: 'rgba(200, 205, 230, 0.8)',
                  maxWidth: '60ch',
                }}
              >
                {description}
              </p>
            )}
            {(cta || secondaryCta) && (
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
            )}
          </div>
          {showCubes && (
            <div className="hero-presentation__media">
              <Cubes
                gridSize={12}
                radius={3.5}
                maxAngle={34}
                cellGap={{ row: 8, col: 8 }}
                borderStyle="1px solid rgba(124, 92, 255, 0.38)"
                faceColor="rgba(124, 92, 255, 0.22)"
                rippleColor="#7c5cff"
                shadow="0 36px 72px rgba(6, 10, 24, 0.55)"
              />
            </div>
          )}
        </div>
        {metrics.length > 0 && (
          <div
            className="metric-grid"
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="surface-glass"
                style={{
                  border: '1px solid rgba(124, 92, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  background: 'rgba(12, 16, 30, 0.75)',
                  display: 'grid',
                  gap: '0.5rem',
                  minHeight: '120px',
                }}
              >
                <span style={{ fontSize: '1.45rem', fontWeight: 700 }}>{metric.value}</span>
                <span style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', letterSpacing: '0.01em' }}>
                  {metric.label}
                </span>
                {metric.context && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(200, 205, 230, 0.75)' }}>{metric.context}</span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CardDashboard;
