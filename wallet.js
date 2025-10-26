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
    if (!window.ethereum) throw new Error('No injected wallet found');
    await switchOrAddChain(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No accounts returned');
    window.wagyDog.provider = new ethers.BrowserProvider(window.ethereum);
    window.wagyDog.signer = await window.wagyDog.provider.getSigner();
    window.wagyDog.address = await window.wagyDog.signer.getAddress();
    // Listeners
    window.ethereum.removeAllListeners?.('accountsChanged');
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            connectWallet();
        } else {
            disconnectWallet();
        }
    });
    window.ethereum.removeAllListeners?.('chainChanged');
    window.ethereum.on('chainChanged', () => window.location.reload());
};

const resolveWalletConnectEthereumProvider = () => {
    const g = window;
    // Try multiple UMD globals for robustness
    if (g.WalletConnectEthereumProvider?.init) return g.WalletConnectEthereumProvider;
    if (g.EthereumProvider?.init) return g.EthereumProvider;
    if (g.WalletConnectProvider?.EthereumProvider?.init) return g.WalletConnectProvider.EthereumProvider;
    if (g.WalletConnectProvider?.default?.init) return g.WalletConnectProvider.default;
    return null;
};

const connectWithWalletConnect = async () => {
    const WCEthereumProvider = resolveWalletConnectEthereumProvider();
    if (!WCEthereumProvider) throw new Error('WalletConnect provider not loaded');
    const provider = await WCEthereumProvider.init({
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
    // Try ensure correct chain
    try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_CONFIG.chainId }] });
    } catch (e) {
        // ignore
    }
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
        if (window.ethereum) {
            await connectWithInjected();
        } else if (resolveWalletConnectEthereumProvider()) {
            await connectWithWalletConnect();
        } else {
            // Fallback: try deep link to MetaMask/Trust
            const dappUrl = encodeURIComponent(window.location.href);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}`;
            const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=20000714&url=${dappUrl}`;
            window.location.href = isIOS ? metamaskDeepLink : trustDeepLink;
            throw new Error('No wallet found. Redirecting to wallet app...');
        }
        console.log('Wallet connected:', window.wagyDog.address);
        await updateUi(window.wagyDog.address);
    } catch (error) {
        console.error("Could not connect to wallet:", error);
        const status = document.getElementById('swap-status');
        if (status) {
            status.classList.remove('hidden');
            status.textContent = `Connection failed: ${error.message}`;
        } else {
            alert(`Connection failed: ${error.message}.`);
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
};

export const openConnectModal = () => {
    const modal = document.getElementById('connect-modal');
    if (!modal) return connectWallet();
    modal.classList.remove('hidden');
};

// Modal actions
document.addEventListener('DOMContentLoaded', () => {
    // Auto-detect pre-authorized accounts (DApp browsers/mobile)
    if (window.ethereum?.request) {
        window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
            if (accounts && accounts.length > 0) {
                connectWithInjected().then(() => updateUi(window.wagyDog.address)).catch(console.error);
            }
        }).catch(() => {});
    }
    const modal = document.getElementById('connect-modal');
    const closeBtn = document.getElementById('connect-modal-close');
    const injectedBtn = document.getElementById('connect-injected');
    const wcBtn = document.getElementById('connect-wc');
    const deepLinkBtn = document.getElementById('connect-deeplink');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (injectedBtn) injectedBtn.addEventListener('click', async () => { modal.classList.add('hidden'); await connectWithInjected().then(() => updateUi(window.wagyDog.address)).catch(console.error); });
    if (wcBtn) wcBtn.addEventListener('click', async () => { modal.classList.add('hidden'); await connectWithWalletConnect().then(() => updateUi(window.wagyDog.address)).catch(console.error); });
    if (deepLinkBtn) deepLinkBtn.addEventListener('click', () => {
        const dappUrl = encodeURIComponent(window.location.href);
        const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}`;
        const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=20000714&url=${dappUrl}`;
        window.location.href = /iPad|iPhone|iPod/.test(navigator.userAgent) ? metamaskDeepLink : trustDeepLink;
    });
});
