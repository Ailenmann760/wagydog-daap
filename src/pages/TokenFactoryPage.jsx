import { useCallback, useMemo, useState } from 'react';
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
import { useAccount, useChainId, useDeployContract, useWaitForTransactionReceipt } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { parseUnits } from 'viem';

const TOKEN_FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_symbol', type: 'string' },
      { internalType: 'uint256', name: 'initialSupply', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const TOKEN_FACTORY_BYTECODE =
  '0x608060405234801561000f575f5ffd5b50604051610abe380380610abe83398101604081905261002e916101df565b5f8351116100735760405162461bcd60e51b815260206004820152600d60248201526c13985b59481c995c5d5a5c9959609a1b60448201526064015b60405180910390fd5b5f8251116100b55760405162461bcd60e51b815260206004820152600f60248201526e14de5b589bdb081c995c5d5a5c9959608a1b604482015260640161006a565b5f6100c084826102d0565b5060016100cd83826102d0565b505f6100db6012600a610483565b6100e59083610495565b6002819055335f818152600360205260408082208490555192935090917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906101319085815260200190565b60405180910390a3505050506104ac565b634e487b7160e01b5f52604160045260245ffd5b5f82601f830112610165575f5ffd5b81516001600160401b0381111561017e5761017e610142565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101ac576101ac610142565b6040528181528382016020018510156101c3575f5ffd5b8160208501602083015e5f918101602001919091529392505050565b5f5f5f606084860312156101f1575f5ffd5b83516001600160401b03811115610206575f5ffd5b61021286828701610156565b602086015190945090506001600160401b0381111561022f575f5ffd5b61023b86828701610156565b925050604084015190509250925092565b600181811c9082168061026057607f821691505b60208210810361027e57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156102cb57805f5260205f20601f840160051c810160208510156102a95750805b601f840160051c820191505b818110156102c8575f81556001016102b5565b50505b505050565b81516001600160401b038111156102e9576102e9610142565b6102fd816102f7845461024c565b84610284565b6020601f82116001811461032f575f83156103185750848201515b5f19600385901b1c1916600184901b1784556102c8565b5f84815260208120601f198516915b8281101561035e578785015182556020948501946001909201910161033e565b508482101561037b57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b634e487b7160e01b5f52601160045260245ffd5b6001815b60018411156103d9578085048111156103bd576103bd61038a565b60018416156103cb57908102905b60019390931c9280026103a2565b935093915050565b5f826103ef5750600161047d565b816103fb57505f61047d565b8160018114610411576002811461041b57610437565b600191505061047d565b60ff84111561042c5761042c61038a565b50506001821b61047d565b5060208310610133831016604e8410600b841016171561045a575081810a61047d565b6104665f19848461039e565b805f19048211156104795761047961038a565b0290505b92915050565b5f61048e83836103e1565b9392505050565b808202811582820484141761047d5761047d61038a565b610605806104b95f395ff3fe608060405234801561000f575f5ffd5b5060043610610090575f3560e01c8063313ce56711610063578063313ce567146100ff57806370a082311461011957806395d89b4114610138578063a9059cbb14610140578063dd62ed3e14610153575f5ffd5b806306fdde0314610094578063095ea7b3146100b257806318160ddd146100d557806323b872dd146100ec575b5f5ffd5b61009c61017d565b6040516100a99190610475565b60405180910390f35b6100c56100c03660046104c5565b610208565b60405190151581526020016100a9565b6100de60025481565b6040519081526020016100a9565b6100c56100fa3660046104ed565b610274565b610107601281565b60405160ff90911681526020016100a9565b6100de610127366004610527565b60036020525f908152604090205481565b61009c61032f565b6100c561014e3660046104c5565b61033c565b6100de610161366004610547565b600460209081525f928352604080842090915290825290205481565b5f805461018990610578565b80601f01602080910402602001604051908101604052809291908181526020018280546101b590610578565b80156102005780601f106101d757610100808354040283529160200191610200565b820191905f5260205f20905b8154815290600101906020018083116101e357829003601f168201915b505050505081565b335f8181526004602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906102629086815260200190565b60405180910390a35060015b92915050565b6001600160a01b0383165f908152600460209081526040808320338452909152812054828110156102ec5760405162461bcd60e51b815260206004820152601960248201527f45524332303a20616c6c6f77616e63652065786365656465640000000000000060448201526064015b60405180910390fd5b6102f683826105b0565b6001600160a01b0386165f908152600460209081526040808320338452909152902055610324858585610351565b506001949350505050565b6001805461018990610578565b5f610348338484610351565b50600192915050565b6001600160a01b0382166103a75760405162461bcd60e51b815260206004820152601860248201527f45524332303a20696e76616c696420726563697069656e74000000000000000060448201526064016102e3565b6001600160a01b0383165f90815260036020526040902054818110156104085760405162461bcd60e51b815260206004820152601660248201527545524332303a2062616c616e636520746f6f206c6f7760501b60448201526064016102e3565b6001600160a01b038085165f8181526003602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906104679086815260200190565b60405180910390a350505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b03811681146104c0575f5ffd5b919050565b5f5f604083850312156104d6575f5ffd5b6104df836104aa565b946020939093013593505050565b5f5f5f606084860312156104ff575f5ffd5b610508846104aa565b9250610516602085016104aa565b929592945050506040919091013590565b5f60208284031215610537575f5ffd5b610540826104aa565b9392505050565b5f5f60408385031215610558575f5ffd5b610561836104aa565b915061056f602084016104aa565b90509250929050565b600181811c9082168061058c57607f821691505b6020821081036105aa57634e487b7160e01b5f52602260045260245ffd5b50919050565b8181038181111561026e57634e487b7160e01b5f52601160045260245ffdfea26469706673582212209f0daaa676c53cd1a7fdcb4290c5811e7201abbc18cbd0f013bd80ee89bdd48b64736f6c634300081e0033';

const DECIMALS = 18;
const DEFAULT_FORM_VALUES = Object.freeze({
  tokenName: 'WagyDog Prime',
  tokenSymbol: 'WAGY',
  totalSupply: '100000000',
});
const BSC_TESTNET_EXPLORER = 'https://testnet.bscscan.com';

const formatBigIntWithSeparators = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const truncateHex = (value, chars = 6) => {
  if (!value) return '';
  const normalized = value.toString();
  if (normalized.length <= chars * 2 + 4) return normalized;
  return `${normalized.slice(0, chars + 2)}…${normalized.slice(-chars)}`;
};

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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [formValues, setFormValues] = useState(() => ({ ...DEFAULT_FORM_VALUES }));
  const [deploymentRequest, setDeploymentRequest] = useState(null);
  const [localError, setLocalError] = useState(null);

  const {
    deployContractAsync,
    data: deployTransactionHash,
    isPending: isSubmitting,
    error: deployError,
    reset: resetDeployMutation,
  } = useDeployContract();

  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: deployTransactionHash,
    chainId: bscTestnet.id,
    query: {
      enabled: Boolean(deployTransactionHash),
      refetchInterval: 3_000,
    },
  });

  const isAwaitingReceipt = Boolean(deployTransactionHash) && !receipt && !receiptError;
  const isSuccess = Boolean(receipt?.contractAddress);
  const isBusy = isSubmitting || isAwaitingReceipt;

  const combinedError = useMemo(() => {
    if (localError) return localError;
    if (deployError) return deployError.shortMessage || deployError.message || 'Failed to deploy contract.';
    if (receiptError) return receiptError.shortMessage || receiptError.message || 'Deployment failed while waiting for confirmation.';
    return null;
  }, [deployError, localError, receiptError]);

  const successSummary = useMemo(() => {
    if (!isSuccess || !receipt?.contractAddress || !deployTransactionHash || !deploymentRequest) {
      return null;
    }

    return {
      contractAddress: receipt.contractAddress,
      contractUrl: `${BSC_TESTNET_EXPLORER}/address/${receipt.contractAddress}`,
      transactionHash: deployTransactionHash,
      transactionUrl: `${BSC_TESTNET_EXPLORER}/tx/${deployTransactionHash}`,
      deployer: deploymentRequest.deployer,
      tokenName: deploymentRequest.name,
      tokenSymbol: deploymentRequest.symbol,
      supply: deploymentRequest.supply,
      supplyInput: deploymentRequest.supplyInput,
      mintedWei: deploymentRequest.mintedWei,
    };
  }, [deployTransactionHash, deploymentRequest, isSuccess, receipt]);

  const statusLabel = useMemo(() => {
    if (isSubmitting) return 'Submitting transaction';
    if (isAwaitingReceipt) return 'Awaiting confirmations';
    if (successSummary) return 'Success';
    if (combinedError) return 'Error';
    return 'Ready';
  }, [combinedError, isAwaitingReceipt, isSubmitting, successSummary]);

  const handleInputChange = useCallback(
    (field) => (event) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleDeploy = useCallback(
    async (event) => {
      event?.preventDefault();
      if (isBusy) return;

      if (!isConnected) {
        setLocalError('Connect your wallet to deploy a token.');
        return;
      }

      if (chainId && chainId !== bscTestnet.id) {
        setLocalError('Switch your wallet to the BNB Smart Chain Testnet before deploying.');
        return;
      }

      const name = formValues.tokenName.trim();
      const symbol = formValues.tokenSymbol.trim().toUpperCase();
      const supplyInput = formValues.totalSupply.trim();

      if (!name) {
        setLocalError('Token name is required.');
        return;
      }

      if (!symbol) {
        setLocalError('Ticker symbol is required.');
        return;
      }

      if (!supplyInput) {
        setLocalError('Total supply is required.');
        return;
      }

      let parsedSupply;
      try {
        parsedSupply = BigInt(supplyInput);
      } catch {
        setLocalError('Total supply must be a positive whole number.');
        return;
      }

      if (parsedSupply <= 0n) {
        setLocalError('Total supply must be greater than zero.');
        return;
      }

      setLocalError(null);
      setDeploymentRequest({
        name,
        symbol,
        supply: parsedSupply,
        supplyInput,
        deployer: address ?? '',
        mintedWei: parseUnits(supplyInput, DECIMALS),
      });
      resetDeployMutation();

      try {
        await deployContractAsync({
          abi: TOKEN_FACTORY_ABI,
          bytecode: TOKEN_FACTORY_BYTECODE,
          args: [name, symbol, parsedSupply],
          chainId: bscTestnet.id,
        });
      } catch (err) {
        const message =
          err?.shortMessage ||
          err?.message ||
          'Failed to submit deployment transaction.';
        setLocalError(message);
      }
    },
    [
      address,
      chainId,
      deployContractAsync,
      formValues.tokenName,
      formValues.tokenSymbol,
      formValues.totalSupply,
      isBusy,
      isConnected,
      resetDeployMutation,
    ],
  );

  const handleReset = useCallback(() => {
    setDeploymentRequest(null);
    setLocalError(null);
    setFormValues(() => ({ ...DEFAULT_FORM_VALUES }));
    resetDeployMutation();
  }, [resetDeployMutation]);

  const mintedSupplyDisplay = successSummary
    ? `${formatBigIntWithSeparators(successSummary.supply)} ${successSummary.tokenSymbol}`
    : null;
  const mintedBaseUnitsDisplay = successSummary
    ? formatBigIntWithSeparators(successSummary.mintedWei)
    : null;
  const displayedDeployer = successSummary?.deployer || address || '';

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
            Every parameter below is audited for best practices. Full supply mints directly to the connected deployer wallet with {DECIMALS}-decimal precision.
        </p>
      </header>
        <form
          onSubmit={handleDeploy}
          style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Token Name</span>
          <input
            type="text"
              value={formValues.tokenName}
              onChange={handleInputChange('tokenName')}
              placeholder="WagyDog Prime"
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
              disabled={isBusy}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Ticker Symbol</span>
          <input
            type="text"
              value={formValues.tokenSymbol}
              onChange={handleInputChange('tokenSymbol')}
              placeholder="WAGY"
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none', textTransform: 'uppercase' }}
              disabled={isBusy}
              maxLength={12}
          />
        </label>
        <label className="surface-glass" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', border: '1px solid rgba(124, 92, 255, 0.18)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Total Supply</span>
          <input
            type="number"
              value={formValues.totalSupply}
              onChange={handleInputChange('totalSupply')}
              min="1"
              step="1"
              placeholder="100000000"
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1rem', outline: 'none' }}
              disabled={isBusy}
          />
        </label>
        </form>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <button
            type="submit"
            className="button-primary"
            style={{
              justifySelf: 'start',
              minWidth: '220px',
              opacity: isBusy ? 0.7 : 1,
            }}
            disabled={isBusy || !isConnected}
            onClick={handleDeploy}
          >
            {isBusy ? 'Deploying…' : 'Deploy audited token contracts'}
            <Rocket size={16} />
          </button>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'grid', gap: '0.35rem' }}>
            <span>
              Status:{' '}
              <strong
                style={{
                  color:
                    statusLabel === 'Success'
                      ? 'var(--color-primary-accent)'
                      : statusLabel === 'Error'
                        ? 'var(--color-danger)'
                        : 'var(--color-text)',
                }}
              >
                {statusLabel}
              </strong>
            </span>
            {!isConnected && <span style={{ color: 'var(--color-warning)' }}>Connect your wallet to deploy.</span>}
            {deployTransactionHash && (
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
                  {truncateHex(deployTransactionHash)}
                </code>{' '}
                <a
                  href={`${BSC_TESTNET_EXPLORER}/tx/${deployTransactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary-accent)', fontWeight: 600 }}
                >
                  View on BscScan
                </a>
              </span>
            )}
            {combinedError && (
              <span style={{ color: 'var(--color-danger)' }}>
                {combinedError}{' '}
                <button
                  type="button"
                  onClick={handleReset}
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
        {successSummary && (
          <div
            className="surface-glass"
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(124, 92, 255, 0.24)',
              display: 'grid',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <span className="badge" style={{ width: 'fit-content' }}>
                Deployment confirmed
              </span>
              <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
                {successSummary.tokenName} is live on BNB Smart Chain Testnet
              </h3>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: '68ch' }}>
                Entire supply has been minted to{' '}
                <strong style={{ color: 'var(--color-primary-accent)' }}>{truncateHex(displayedDeployer)}</strong>. Share the
                details below with your developers to continue integrations.
              </p>
            </div>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <article
                className="surface-glass"
                style={{
                  padding: '1rem',
                  border: '1px solid rgba(124, 92, 255, 0.22)',
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                  Contract Address
                </span>
                <code
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(9, 10, 18, 0.9)',
                    border: '1px solid rgba(124, 92, 255, 0.25)',
                    wordBreak: 'break-all',
                  }}
                >
                  {successSummary.contractAddress}
                </code>
                <a
                  href={successSummary.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary-accent)', fontWeight: 600 }}
                >
                  View contract
                </a>
              </article>
              <article
                className="surface-glass"
                style={{
                  padding: '1rem',
                  border: '1px solid rgba(124, 92, 255, 0.22)',
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                  Transaction Hash
                </span>
                <code
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(9, 10, 18, 0.9)',
                    border: '1px solid rgba(124, 92, 255, 0.25)',
                    wordBreak: 'break-all',
                  }}
                >
                  {successSummary.transactionHash}
                </code>
                <a
                  href={successSummary.transactionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary-accent)', fontWeight: 600 }}
                >
                  View transaction
                </a>
              </article>
              <article
                className="surface-glass"
                style={{
                  padding: '1rem',
                  border: '1px solid rgba(124, 92, 255, 0.22)',
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                  Total Supply Minted
                </span>
                <strong style={{ fontSize: '1.1rem' }}>{mintedSupplyDisplay}</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {mintedBaseUnitsDisplay} base units @ {DECIMALS} decimals
                </span>
              </article>
              <article
                className="surface-glass"
                style={{
                  padding: '1rem',
                  border: '1px solid rgba(124, 92, 255, 0.22)',
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                  Deployer Rights
                </span>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                  Wallet <strong>{truncateHex(displayedDeployer)}</strong> now controls 100% of the supply and can distribute tokens immediately.
                </p>
              </article>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="button-secondary" onClick={handleReset}>
                Deploy another token
              </button>
            </div>
          </div>
        )}
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
