import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Layers,
  Wallet,
  Users,
  Smartphone,
  Repeat,
  Coins,
} from 'lucide-react';

const ICON_MAP = {
  swap: Repeat,
  staking: Coins,
  analytics: BarChart3,
  liquidity: Layers,
  wallet: Wallet,
  community: Users,
  mobile: Smartphone,
};

const Carousel = ({ items = [], autoplay = false, pauseOnHover = false, interval = 6000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const itemCount = safeItems.length;

  const carouselGap = 'clamp(1rem, 2.5vw, 1.5rem)';
  const sectionPadding = 'clamp(2rem, 3vw, 2.5rem)';

  useEffect(() => {
    if (!autoplay || itemCount <= 1) return undefined;

    const timer = setInterval(() => {
      if (pauseOnHover && isHovering) return;
      setActiveIndex((prev) => (prev + 1) % itemCount);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, itemCount, interval, pauseOnHover, isHovering]);

  const goTo = (index) => {
    if (itemCount === 0) return;
    const next = (index + itemCount) % itemCount;
    setActiveIndex(next);
  };

  const renderIcon = (icon) => {
    const Icon = ICON_MAP[icon] || Layers;
    return (
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '44px',
          width: '44px',
          borderRadius: '14px',
          background: 'rgba(124, 92, 255, 0.18)',
          border: '1px solid rgba(124, 92, 255, 0.24)',
          color: '#a899ff',
        }}
      >
        <Icon size={22} />
      </span>
    );
  };

  return (
    <section
      className="surface-glass carousel-root"
      style={{
        padding: sectionPadding,
        marginTop: '3rem',
        background: 'linear-gradient(130deg, rgba(12, 16, 30, 0.92), rgba(24, 30, 52, 0.92))',
        border: '1px solid rgba(124, 92, 255, 0.16)',
        '--carousel-padding': sectionPadding,
        '--carousel-gap': carouselGap,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <span className="chip">Protocol Features</span>
          <h2 style={{ margin: '0.75rem 0 0', fontSize: '1.85rem', fontWeight: 600 }}>Institutional-grade dApp infrastructure</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              background: 'rgba(16, 20, 40, 0.85)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              background: 'rgba(16, 20, 40, 0.85)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="carousel-viewport" style={{ overflow: 'hidden', position: 'relative', maxWidth: '100%' }}>
        <div
          className="carousel-track"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 'var(--carousel-gap)',
            width: '100%',
            transform: itemCount > 0 ? `translateX(calc(-${activeIndex} * (100% + var(--carousel-gap))))` : 'translateX(0)',
            transition: 'transform 0.6s ease',
            willChange: 'transform',
          }}
        >
          {safeItems.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              style={{
                border: '1px solid rgba(124, 92, 255, 0.18)',
                borderRadius: '18px',
                padding: '1.75rem',
                background: index === activeIndex ? 'rgba(20, 24, 44, 0.9)' : 'rgba(14, 18, 34, 0.78)',
                boxShadow: index === activeIndex ? '0 32px 60px -36px rgba(124, 92, 255, 0.45)' : 'none',
                minHeight: '220px',
                display: 'grid',
                gap: '1rem',
                flex: '0 0 100%',
                minWidth: 0,
              }}
            >
              {renderIcon(item.icon)}
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{item.title}</h3>
                {item.description && (
                  <p style={{ margin: '0.65rem 0 0', fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>{item.description}</p>
                )}
              </div>
              {item.meta && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginTop: 'auto',
                  }}
                >
                  {item.meta.map((chip) => (
                    <span
                      key={chip}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '999px',
                        background: 'rgba(124, 92, 255, 0.12)',
                        border: '1px solid rgba(124, 92, 255, 0.2)',
                        fontSize: '0.78rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
        {safeItems.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => goTo(index)}
            style={{
              width: index === activeIndex ? '16px' : '10px',
              height: '10px',
              borderRadius: '999px',
              border: 'none',
              background: index === activeIndex ? 'var(--color-primary)' : 'rgba(124, 92, 255, 0.25)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;
