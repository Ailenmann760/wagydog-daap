import { CHAIN_CONFIG, PROJECT_ID } from './config.js';

window.wagyDog = {
    provider: null,
    signer: null,
    address: null,
    getWalletState: function() {
        return {
            provider: this.provider,
            signer: this.signer,
            address: this.address
        };
    }
};

export const updateUi = async (address) => {
    console.log('Updating UI for address:', address);
    const allConnectButtons = document.querySelectorAll('#header-connect-btn, #mobile-connect-btn, #dashboard-connect-btn, #swap-action-btn');
    const connectedInfo = document.getElementById('wallet-connected-info');
    const walletAddressSpan = document.getElementById('wallet-address');
    const walletBalanceSpan = document.getElementById('wallet-balance');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const mintBtn = document.getElementById('mint-nft-btn');
    const connectionPrompt = document.getElementById('wallet-connection-info');
    const swapActionButton = document.getElementById('swap-action-btn');

    if (address) {
        const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        allConnectButtons.forEach(btn => btn.textContent = shortAddress);
        if (swapActionButton) swapActionButton.textContent = 'Swap';
        if (walletAddressSpan) walletAddressSpan.textContent = shortAddress;
        if (connectedInfo) connectedInfo.classList.remove('hidden');
        if (disconnectBtn) disconnectBtn.classList.remove('hidden');
        if (connectionPrompt) connectionPrompt.classList.add('hidden');
        if (mintBtn) mintBtn.disabled = false;

        // Fetch BNB balance
        if (window.wagyDog.provider) {
            try {
                const balance = await window.wagyDog.provider.getBalance(address);
                if (walletBalanceSpan) walletBalanceSpan.textContent = parseFloat(ethers.formatEther(balance)).toFixed(4);
            } catch (error) {
                console.error('Balance fetch failed:', error);
                if (walletBalanceSpan) walletBalanceSpan.textContent = 'Error';
            }
        }
    } else {
        allConnectButtons.forEach(btn => btn.textContent = 'Connect Wallet');
        if (swapActionButton) swapActionButton.textContent = 'Connect Wallet to Swap';
        if (connectedInfo) connectedInfo.classList.add('hidden');
        if (disconnectBtn) disconnectBtn.classList.add('hidden');
        if (connectionPrompt) connectionPrompt.classList.remove('hidden');
        if (mintBtn) mintBtn.disabled = true;
        if (walletBalanceSpan) walletBalanceSpan.textContent = '0';
    }
};

const switchOrAddChain = async (ethProvider) => {
    try {
        await ethProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_CONFIG.chainId }]
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await ethProvider.request({
                method: 'wallet_addEthereumChain',
                params: [CHAIN_CONFIG]
            });
        } else {
            throw switchError;
        }
    }
};

const connectWithInjected = async () => {
    if (!window.ethereum) {
        // Try to detect mobile wallet apps
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            throw new Error('Please open this DApp in your wallet app (MetaMask, Trust Wallet, etc.)');
        }
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
    }

    try {
        await switchOrAddChain(window.ethereum);
    } catch (error) {
        console.error('Chain switch failed:', error);
        throw new Error('Failed to switch to BSC Testnet. Please add BSC Testnet to your wallet manually.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No accounts returned from wallet');
    
    window.wagyDog.provider = new ethers.BrowserProvider(window.ethereum);
    window.wagyDog.signer = await window.wagyDog.provider.getSigner();
    window.wagyDog.address = await window.wagyDog.signer.getAddress();
    
    // Verify we're on the correct chain
    const network = await window.wagyDog.provider.getNetwork();
    if (network.chainId !== 97n) {
        throw new Error('Please switch to BSC Testnet (Chain ID: 97)');
    }
    
    // Setup event listeners
    window.ethereum.removeAllListeners?.('accountsChanged');
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length > 0) {
            connectWallet();
        } else {
            disconnectWallet();
        }
    });
    
    window.ethereum.removeAllListeners?.('chainChanged');
    window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        if (chainId !== '0x61') {
            alert('Please switch back to BSC Testnet');
            window.location.reload();
        }
    });
};

const connectWithWalletConnect = async () => {
    if (!window.WalletConnectEthereumProvider) throw new Error('WalletConnect provider not loaded');
    const ProviderCtor = window.WalletConnectEthereumProvider.default || window.WalletConnectEthereumProvider;
    const provider = await ProviderCtor.init({
        projectId: PROJECT_ID,
        chains: [97],
        showQrModal: true,
        rpcMap: { 97: CHAIN_CONFIG.rpcUrls[0] },
        methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
            'wallet_switchEthereumChain',
            'wallet_addEthereumChain'
        ]
    });
    await provider.enable();
    try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_CONFIG.chainId }] });
    } catch (_) {}
    window.wagyDog.provider = new ethers.BrowserProvider(provider);
    window.wagyDog.signer = await window.wagyDog.provider.getSigner();
    window.wagyDog.address = await window.wagyDog.signer.getAddress();
    provider.removeAllListeners?.('accountsChanged');
    provider.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            connectWallet();
        } else {
            disconnectWallet();
        }
    });
    provider.removeAllListeners?.('chainChanged');
    provider.on('chainChanged', () => window.location.reload());
};

export const connectWallet = async () => {
    try {
        console.log('Attempting to connect wallet...');
        
        // Check if we're in a mobile DApp browser
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isDAppBrowser = window.ethereum && (
            window.ethereum.isMetaMask || 
            window.ethereum.isTrust || 
            window.ethereum.isCoinbaseWallet ||
            window.ethereum.isImToken ||
            window.ethereum.isBinance
        );

        if (window.ethereum) {
            console.log('Using injected wallet');
            await connectWithInjected();
        } else if (isMobile && !isDAppBrowser) {
            // Mobile without wallet - show connection modal
            openConnectModal();
            return;
        } else {
            // Desktop without wallet
            throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
        }
        
        console.log('Wallet connected successfully:', window.wagyDog.address);
        await updateUi(window.wagyDog.address);
        
        // Dispatch wallet connected event
        window.dispatchEvent(new CustomEvent('walletConnected', { 
            detail: { address: window.wagyDog.address } 
        }));
        
        // Show success message
        const status = document.getElementById('swap-status');
        if (status) {
            status.classList.remove('hidden');
            status.style.color = '#10B981';
            status.textContent = 'Wallet connected successfully!';
            setTimeout(() => status.classList.add('hidden'), 3000);
        }
        
    } catch (error) {
        console.error("Could not connect to wallet:", error);
        
        // Show user-friendly error messages
        let errorMessage = error.message;
        if (error.code === 4001) {
            errorMessage = 'Connection rejected by user';
        } else if (error.code === -32002) {
            errorMessage = 'Connection request already pending. Please check your wallet.';
        }
        
        const status = document.getElementById('swap-status');
        if (status) {
            status.classList.remove('hidden');
            status.style.color = '#EF4444';
            status.textContent = `Connection failed: ${errorMessage}`;
            setTimeout(() => status.classList.add('hidden'), 5000);
        }
        
        // Don't show alert for user rejection
        if (error.code !== 4001) {
            alert(`Connection failed: ${errorMessage}`);
        }
        
        disconnectWallet();
    }
};

export const disconnectWallet = () => {
    window.wagyDog.provider = null;
    window.wagyDog.signer = null;
    window.wagyDog.address = null;
    console.log("Wallet disconnected.");
    updateUi(null);
    
    // Dispatch wallet disconnected event
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
};

export const openConnectModal = () => {
    const modal = document.getElementById('connect-modal');
    if (!modal) return connectWallet();
    modal.classList.remove('hidden');
};

// Modal actions
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('connect-modal');
    const closeBtn = document.getElementById('connect-modal-close');
    const injectedBtn = document.getElementById('connect-injected');
    const wcBtn = document.getElementById('connect-wc');
    const deepLinkBtn = document.getElementById('connect-deeplink');
    // Explicit wallet shortcuts
    const metamaskBtn = document.getElementById('wallet-metamask');
    const trustBtn = document.getElementById('wallet-trust');
    const coinbaseBtn = document.getElementById('wallet-coinbase');
    const okxBtn = document.getElementById('wallet-okx');
    const phantomBtn = document.getElementById('wallet-phantom');
    const solflareBtn = document.getElementById('wallet-solflare');
    
    if (closeBtn) closeBtn.addEventListener('click', () => modal?.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { 
        if (e.target === modal) modal.classList.add('hidden'); 
    });
    
    if (injectedBtn) injectedBtn.addEventListener('click', async () => { 
        modal?.classList.add('hidden'); 
        try {
            await connectWithInjected();
            await updateUi(window.wagyDog.address);
        } catch (error) {
            console.error('Injected wallet connection failed:', error);
            alert(`Connection failed: ${error.message}`);
        }
    });
    
    if (wcBtn) wcBtn.addEventListener('click', async () => { 
        modal?.classList.add('hidden'); 
        try {
            await connectWithWalletConnect();
            await updateUi(window.wagyDog.address);
        } catch (error) {
            console.error('WalletConnect connection failed:', error);
            alert(`WalletConnect failed: ${error.message}`);
        }
    });

    // Direct wallet buttons map to WC or injected
    const tryInjectedThenWc = async (preferred) => {
        modal?.classList.add('hidden');
        try {
            if (window.ethereum) {
                // Some wallets expose flags; attempt injected first
                await connectWithInjected();
            } else {
                await connectWithWalletConnect();
            }
            await updateUi(window.wagyDog.address);
        } catch (error) {
            console.error(`${preferred} connect failed:`, error);
            alert(`${preferred} connect failed: ${error.message}`);
        }
    };
    metamaskBtn?.addEventListener('click', () => tryInjectedThenWc('MetaMask'));
    trustBtn?.addEventListener('click', () => tryInjectedThenWc('Trust Wallet'));
    coinbaseBtn?.addEventListener('click', () => tryInjectedThenWc('Coinbase Wallet'));
    okxBtn?.addEventListener('click', () => tryInjectedThenWc('OKX Wallet'));
    // Phantom/Solflare are Solana wallets; we still route via WC to show options
    phantomBtn?.addEventListener('click', () => tryInjectedThenWc('Phantom'));
    solflareBtn?.addEventListener('click', () => tryInjectedThenWc('Solflare'));
    
    if (deepLinkBtn) deepLinkBtn.addEventListener('click', () => {
        const currentUrl = window.location.href;
        const dappUrl = encodeURIComponent(currentUrl);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        if (isIOS) {
            // iOS deep links
            const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
            const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=20000714&url=${dappUrl}`;
            
            // Try MetaMask first, fallback to Trust Wallet
            window.location.href = metamaskDeepLink;
            setTimeout(() => {
                window.location.href = trustDeepLink;
            }, 1000);
        } else if (isAndroid) {
            // Android deep links
            const metamaskIntent = `intent://dapp/${window.location.host}${window.location.pathname}#Intent;scheme=https;package=io.metamask;end`;
            const trustIntent = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.wallet.crypto.trustapp;end`;
            
            window.location.href = metamaskIntent;
            setTimeout(() => {
                window.location.href = trustIntent;
            }, 1000);
        } else {
            alert('Please install MetaMask or Trust Wallet on your mobile device');
        }
    });
});
