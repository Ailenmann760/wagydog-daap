import { PROJECT_ID, CHAIN_CONFIG } from './config.js';

let web3Modal;
try {
    if (typeof window.Web3Modal === 'undefined') {
        throw new Error('Web3Modal script not loaded');
    }
    web3Modal = new window.Web3Modal.Standalone({
        projectId: PROJECT_ID,
        walletConnectVersion: 2,
        chains: [CHAIN_CONFIG],
    });
    console.log('Web3Modal v2 Standalone initialized successfully');
} catch (error) {
    console.error('Failed to initialize Web3Modal:', error);
}

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

export const updateUi = (address) => {
    console.log('Updating UI for address:', address);
    const allConnectButtons = document.querySelectorAll('#header-connect-btn, #mobile-connect-btn, #dashboard-connect-btn, #swap-action-btn');
    const connectedInfo = document.getElementById('wallet-connected-info');
    const walletAddressSpan = document.getElementById('wallet-address');
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
    } else {
        allConnectButtons.forEach(btn => btn.textContent = 'Connect Wallet');
        if (swapActionButton) swapActionButton.textContent = 'Connect Wallet';
        if (connectedInfo) connectedInfo.classList.add('hidden');
        if (disconnectBtn) disconnectBtn.classList.add('hidden');
        if (connectionPrompt) connectionPrompt.classList.remove('hidden');
        if (mintBtn) mintBtn.disabled = true;
    }
};

export const connectWallet = async () => {
    if (!web3Modal) {
        console.error('Web3Modal not available');
        alert('Wallet connection not available. Ensure MetaMask/Trust is installed and page is HTTPS.');
        return;
    }
    try {
        console.log('Attempting to connect wallet...');
        // Ensure chain is added/switched (for MetaMask/others)
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x61' }], // BSC Testnet hex
                });
            } catch (switchError) {
                if (switchError.code === 4902) { // Chain not added
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [CHAIN_CONFIG],
                    });
                } else {
                    throw switchError;
                }
            }
        }
        const provider = await web3Modal.connect();
        window.wagyDog.provider = new ethers.providers.Web3Provider(provider);
        window.wagyDog.signer = window.wagyDog.provider.getSigner();
        window.wagyDog.address = await window.wagyDog.signer.getAddress();
        console.log("Wallet connected:", window.wagyDog.address);
        updateUi(window.wagyDog.address);
        provider.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                connectWallet();
            } else {
                disconnectWallet();
            }
        });
        provider.on("chainChanged", () => window.location.reload());
    } catch (error) {
        console.error("Could not connect to wallet:", error);
        alert(`Connection failed: ${error.message}. Try refreshing or checking wallet extension.`);
        disconnectWallet();
    }
};

export const disconnectWallet = () => {
    window.wagyDog.provider = null;
    window.wagyDog.signer = null;
    window.wagyDog.address = null;
    console.log("Wallet disconnected.");
    if (web3Modal) web3Modal.clearCachedProvider();
    updateUi(null);
};
