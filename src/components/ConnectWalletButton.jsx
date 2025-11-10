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
}) => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const displayLabel =
    isConnected && address ? connectedLabel || truncateAddress(address) : label;

  return (
    <button
      type="button"
      onClick={() => open({ view: isConnected ? 'Account' : 'Connect' })}
      className={classNames(variant === 'secondary' ? 'button-secondary' : 'button-primary', className)}
      style={style}
      aria-label={displayLabel}
      title={displayLabel}
    >
      <Wallet size={iconSize} />
      <span className="connect-wallet-button__label">{displayLabel}</span>
    </button>
  );
};

export default ConnectWalletButton;
