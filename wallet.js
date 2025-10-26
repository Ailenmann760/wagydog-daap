import { CHAIN_CONFIG, PROJECT_ID, WALLET_CONFIG } from './config.js';

window.wagyDog = {
    provider: null,
    signer: null,
    address: null,
    connectedWallet: null,
    getWalletState: function() {
        return {
            provider: this.provider,
            signer: this.signer,
            address: this.address,
            connectedWallet: this.connectedWallet
        };
    },
    signTransaction: signTransaction
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
    const provider = await window.WalletConnectEthereumProvider.default.init({
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
        } else {
            // Show wallet selection modal
            openConnectModal();
            return;
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

// Enhanced transaction signing function
export const signTransaction = async (transactionRequest) => {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) {
        throw new Error('No wallet connected');
    }
    
    try {
        // Show transaction confirmation
        const confirmed = await showTransactionConfirmation(transactionRequest);
        if (!confirmed) {
            throw new Error('Transaction rejected by user');
        }
        
        // Sign and send transaction
        const tx = await signer.sendTransaction(transactionRequest);
        
        // Show pending status
        showTransactionStatus('pending', tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        
        // Show success status
        showTransactionStatus('success', receipt.hash);
        
        return receipt;
    } catch (error) {
        showTransactionStatus('error', null, error.message);
        throw error;
    }
};

const showTransactionConfirmation = async (txRequest) => {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-6">
                <div class="text-center mb-6">
                    <div class="text-4xl mb-4">⚠️</div>
                    <h3 class="text-xl font-bold mb-2">Confirm Transaction</h3>
                    <p class="text-gray-600">Please review the transaction details</p>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">To:</span>
                        <span class="font-mono">${txRequest.to?.substring(0, 10)}...${txRequest.to?.substring(txRequest.to.length - 8)}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Value:</span>
                        <span>${txRequest.value ? ethers.formatEther(txRequest.value) + ' BNB' : '0 BNB'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Gas Limit:</span>
                        <span>${txRequest.gasLimit || 'Auto'}</span>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button class="btn-secondary flex-1" onclick="this.closest('.fixed').remove(); resolve(false);">Cancel</button>
                    <button class="btn-primary flex-1" onclick="this.closest('.fixed').remove(); resolve(true);">Confirm</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.btn-secondary').onclick = () => {
            modal.remove();
            resolve(false);
        };
        
        modal.querySelector('.btn-primary').onclick = () => {
            modal.remove();
            resolve(true);
        };
        
        document.body.appendChild(modal);
    });
};

const showTransactionStatus = (status, hash, error = null) => {
    const statusEl = document.getElementById('swap-status');
    if (!statusEl) return;
    
    statusEl.classList.remove('hidden');
    
    switch (status) {
        case 'pending':
            statusEl.style.color = '#3B82F6';
            statusEl.innerHTML = `⏳ Transaction pending... <a href="https://testnet.bscscan.com/tx/${hash}" target="_blank" class="underline">View on BSCScan</a>`;
            break;
        case 'success':
            statusEl.style.color = '#10B981';
            statusEl.innerHTML = `✅ Transaction successful! <a href="https://testnet.bscscan.com/tx/${hash}" target="_blank" class="underline">View on BSCScan</a>`;
            setTimeout(() => statusEl.classList.add('hidden'), 10000);
            break;
        case 'error':
            statusEl.style.color = '#EF4444';
            statusEl.textContent = `❌ Transaction failed: ${error}`;
            setTimeout(() => statusEl.classList.add('hidden'), 10000);
            break;
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
    
    // Populate wallet options dynamically
    const walletContainer = document.getElementById('wallet-options-container');
    if (walletContainer) {
        walletContainer.innerHTML = WALLET_CONFIG.supportedWallets.map(wallet => `
            <button class="wallet-option-btn" data-wallet="${wallet.id}">
                <i class="${wallet.icon} text-2xl"></i>
                <span>${wallet.name}</span>
            </button>
        `).join('');
        
        // Add click handlers for wallet options
        walletContainer.querySelectorAll('.wallet-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const walletId = btn.dataset.wallet;
                handleWalletSelection(walletId);
                modal.classList.add('hidden');
            });
        });
    }
    
    modal.classList.remove('hidden');
};

const handleWalletSelection = async (walletId) => {
    try {
        const wallet = WALLET_CONFIG.supportedWallets.find(w => w.id === walletId);
        if (!wallet) throw new Error('Wallet not supported');
        
        // Check if we're on mobile and need deep linking
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && !window.ethereum) {
            // Use deep linking for mobile
            const currentUrl = encodeURIComponent(window.location.href);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const deepLink = isIOS ? wallet.deepLink.ios : wallet.deepLink.android;
            
            if (deepLink) {
                const finalUrl = deepLink.replace('{url}', window.location.host + window.location.pathname);
                window.location.href = finalUrl;
                return;
            }
        }
        
        // Try injected wallet connection
        if (window.ethereum) {
            await connectWithInjected();
        } else {
            // Fallback to WalletConnect
            await connectWithWalletConnect();
        }
        
        await updateUi(window.wagyDog.address);
        
        // Dispatch wallet connected event
        window.dispatchEvent(new CustomEvent('walletConnected', { 
            detail: { address: window.wagyDog.address, wallet: walletId } 
        }));
        
    } catch (error) {
        console.error(`Failed to connect with ${walletId}:`, error);
        alert(`Failed to connect with ${walletId}: ${error.message}`);
    }
};

// Modal actions
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('connect-modal');
    const closeBtn = document.getElementById('connect-modal-close');
    
    if (closeBtn) closeBtn.addEventListener('click', () => modal?.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { 
        if (e.target === modal) modal.classList.add('hidden'); 
    });
    
    // Legacy button support for backward compatibility
    const injectedBtn = document.getElementById('connect-injected');
    const wcBtn = document.getElementById('connect-wc');
    const deepLinkBtn = document.getElementById('connect-deeplink');
    
    if (injectedBtn) injectedBtn.addEventListener('click', async () => { 
        modal?.classList.add('hidden'); 
        await handleWalletSelection('metamask');
    });
    
    if (wcBtn) wcBtn.addEventListener('click', async () => { 
        modal?.classList.add('hidden'); 
        try {
            await connectWithWalletConnect();
            await updateUi(window.wagyDog.address);
            window.dispatchEvent(new CustomEvent('walletConnected', { 
                detail: { address: window.wagyDog.address, wallet: 'walletconnect' } 
            }));
        } catch (error) {
            console.error('WalletConnect connection failed:', error);
            alert(`WalletConnect failed: ${error.message}`);
        }
    });
    
    if (deepLinkBtn) deepLinkBtn.addEventListener('click', () => {
        // Show wallet selection for mobile deep linking
        const walletOptions = WALLET_CONFIG.supportedWallets.slice(0, 3); // Show top 3 wallets
        const currentUrl = encodeURIComponent(window.location.href);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        walletOptions.forEach((wallet, index) => {
            setTimeout(() => {
                const deepLink = isIOS ? wallet.deepLink.ios : wallet.deepLink.android;
                if (deepLink) {
                    const finalUrl = deepLink.replace('{url}', window.location.host + window.location.pathname);
                    window.location.href = finalUrl;
                }
            }, index * 1000);
        });
    });
});
