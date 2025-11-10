import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const ConnectWalletButton = ({
  label = 'Connect Wallet',
  connectedLabel,
  className,
  variant = 'primary',
  style,
  iconSize = 16,
  compactBreakpoint = 768,
  forceCompact = false,
}) => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [isCompact, setIsCompact] = useState(forceCompact);

  useEffect(() => {
    if (typeof window === 'undefined' || compactBreakpoint == null) return undefined;

    const mediaQuery = window.matchMedia(`(max-width: ${compactBreakpoint}px)`);
    const handleChange = (event) => {
      setIsCompact(forceCompact || event.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [compactBreakpoint, forceCompact]);

  useEffect(() => {
    if (forceCompact) {
      setIsCompact(true);
    }
  }, [forceCompact]);

  const displayLabel = useMemo(
    () => (isConnected && address ? connectedLabel || truncateAddress(address) : label),
    [address, connectedLabel, isConnected, label],
  );

  const handleClick = useCallback(() => {
    open({ view: isConnected ? 'Account' : 'Connect' });
  }, [isConnected, open]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        variant === 'secondary' ? 'button-secondary' : 'button-primary',
        className,
        { 'connect-wallet-button--compact': isCompact },
      )}
      style={style}
      aria-label={displayLabel}
      title={displayLabel}
    >
      <Wallet size={iconSize} />
      {!isCompact && <span className="connect-wallet-button__label">{displayLabel}</span>}
    </button>
  );
};

export default ConnectWalletButton;
