import { CHAIN_CONFIG } from './config.js';

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

        // Fetch and display BNB balance
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

export const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask or Trust Wallet not installed. Please install one.');
        return;
    }
    try {
        console.log('Attempting to connect wallet...');
        // Switch to BNB Testnet
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x61' }], // 97 hex
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [CHAIN_CONFIG],
                });
            } else {
                throw switchError;
            }
        }
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }
        window.wagyDog.provider = new ethers.BrowserProvider(window.ethereum);
        window.wagyDog.signer = await window.wagyDog.provider.getSigner();
        window.wagyDog.address = await window.wagyDog.signer.getAddress();
        console.log("Wallet connected:", window.wagyDog.address);
        await updateUi(window.wagyDog.address);
        // Listeners
        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                connectWallet();
            } else {
                disconnectWallet();
            }
        });
        window.ethereum.on("chainChanged", () => window.location.reload());
    } catch (error) {
        console.error("Could not connect to wallet:", error);
        alert(`Connection failed: ${error.message}. Make sure MetaMask is unlocked.`);
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
