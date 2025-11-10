import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';

const MOCK_GAS_FEE_BNB = 0.0125;

const createMockHash = () =>
  `0x${Array.from({ length: 64 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')}`;

const useDeployContract = ({ simulate = true } = {}) => {
  const abortRef = useRef(false);
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState('idle');
  const [transactionHash, setTransactionHash] = useState(null);
  const [error, setError] = useState(null);
  const [gasFeeBnb, setGasFeeBnb] = useState(MOCK_GAS_FEE_BNB);

  useEffect(() => {
    abortRef.current = false;
    return () => {
      abortRef.current = true;
    };
  }, []);

  const deploy = useCallback(
    async ({ writeConfig, expectedGasFeeBnb = MOCK_GAS_FEE_BNB } = {}) => {
      if (!isConnected) {
        const err = new Error('Connect your wallet to deploy contracts.');
        setError(err);
        setStatus('error');
        throw err;
      }

      setStatus('pending');
      setError(null);
      setTransactionHash(null);

      try {
        let hash;

        if (simulate || !writeConfig) {
          await new Promise((resolve) => setTimeout(resolve, 1_100 + Math.random() * 900));
          hash = createMockHash();
        } else if (typeof writeContractAsync === 'function') {
          hash = await writeContractAsync(writeConfig);
        } else {
          throw new Error('Contract write function is unavailable.');
        }

        if (abortRef.current) return { hash: null, gasFeeBnb: expectedGasFeeBnb };

        setTransactionHash(hash);
        setGasFeeBnb(expectedGasFeeBnb);
        setStatus('success');

        return { hash, gasFeeBnb: expectedGasFeeBnb };
      } catch (err) {
        if (abortRef.current) return { hash: null, gasFeeBnb: expectedGasFeeBnb };

        const resolvedError = err instanceof Error ? err : new Error('Failed to deploy token contract.');
        setError(resolvedError);
        setStatus('error');
        throw resolvedError;
      }
    },
    [isConnected, simulate, writeContractAsync],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setTransactionHash(null);
    setError(null);
    setGasFeeBnb(MOCK_GAS_FEE_BNB);
  }, []);

  const isLoading = status === 'pending';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const gasFeeDisplay = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
    return `${formatter.format(gasFeeBnb)} BNB`;
  }, [gasFeeBnb]);

  return {
    deploy,
    reset,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    transactionHash,
    gasFeeBnb,
    gasFeeDisplay,
  };
};

export default useDeployContract;
