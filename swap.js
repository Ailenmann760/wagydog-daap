import { ROUTER_ADDRESS, ROUTER_ABI, ERC20_ABI, WAGY_ADDRESS, WBNB_ADDRESS, TOKENS, FACTORY_ADDRESS } from './config.js';
import { connectWallet } from './wallet.js';

const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromTokenSelect = document.getElementById('from-token-select');
const toTokenSelect = document.getElementById('to-token-select');
const swapDirectionBtn = document.getElementById('swap-direction-btn');
const swapActionButton = document.getElementById('swap-action-btn');
const swapStatus = document.getElementById('swap-status');

// Default tokens (use BNB as native and CAKE as target)
let fromToken = TOKENS.find(t => t.symbol === 'BNB') || TOKENS[0];
let toToken = TOKENS.find(t => t.symbol === 'CAKE') || TOKENS[2];

// Price fetching and calculation
let currentPrices = {};
let priceUpdateInterval;

const updateTokenDisplay = (buttonElement, token) => {
    if (!buttonElement) return;
    const logoImg = buttonElement.querySelector('.token-logo');
    const nameSpan = buttonElement.querySelector('.token-name');
    if (logoImg) {
        logoImg.src = token.logo;
        logoImg.alt = token.name;
        logoImg.onerror = () => { logoImg.src = 'https://placehold.co/48x48/0d1117/FFFFFF?text=' + token.name; };
    }
    if (nameSpan) nameSpan.textContent = token.name;
    console.log(`Updated token display for ${token.name}`);
};

const handleSwapDirection = () => {
    [fromToken, toToken] = [toToken, fromToken];
    const fromVal = fromAmountInput ? fromAmountInput.value : '';
    const toVal = toAmountInput ? toAmountInput.value : '';
    if (fromAmountInput) fromAmountInput.value = toVal;
    if (toAmountInput) toAmountInput.value = fromVal;
    if (fromTokenSelect) updateTokenDisplay(fromTokenSelect, fromToken);
    if (toTokenSelect) updateTokenDisplay(toTokenSelect, toToken);
    console.log('Swap direction toggled');
};

// Fetch real-time prices from PancakeSwap
const fetchTokenPrices = async () => {
    if (!window.wagyDog.provider) return;
    
    try {
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, window.wagyDog.provider);
        
        // Update prices for all token pairs
        for (const token of TOKENS) {
            if (token.isNative) continue;
            
            try {
                const tokenAddress = ethers.getAddress(token.address);
                const path = [WBNB_ADDRESS, tokenAddress];
                const amountIn = ethers.parseEther('1'); // 1 BNB
                const amountsOut = await router.getAmountsOut(amountIn, path);
                const price = parseFloat(ethers.formatUnits(amountsOut[1], token.decimals));
                currentPrices[tokenAddress] = price;
            } catch (error) {
                console.warn(`Failed to fetch price for ${token.symbol}:`, error);
                currentPrices[token.address] = 0;
            }
        }
        
        // Update the displayed exchange rate
        updateExchangeRate();
    } catch (error) {
        console.error('Failed to fetch token prices:', error);
    }
};

const updateExchangeRate = () => {
    const infoContainer = document.querySelector('.swap-info-container p');
    if (!infoContainer) return;
    
    if (fromToken.isNative && !toToken.isNative) {
        const rate = currentPrices[toToken.address] || 0;
        infoContainer.textContent = `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`;
    } else if (!fromToken.isNative && toToken.isNative) {
        const rate = currentPrices[fromToken.address] || 0;
        const inverseRate = rate > 0 ? (1 / rate).toFixed(8) : 0;
        infoContainer.textContent = `1 ${fromToken.symbol} = ${inverseRate} ${toToken.symbol}`;
    } else if (!fromToken.isNative && !toToken.isNative) {
        const fromRate = currentPrices[fromToken.address] || 0;
        const toRate = currentPrices[toToken.address] || 0;
        const crossRate = (fromRate > 0 && toRate > 0) ? (fromRate / toRate).toFixed(6) : 0;
        infoContainer.textContent = `1 ${fromToken.symbol} = ${crossRate} ${toToken.symbol}`;
    } else {
        infoContainer.textContent = `1 ${fromToken.symbol} = 1 ${toToken.symbol}`;
    }
};

const calculateOutputAmount = async (inputAmount) => {
    if (!window.wagyDog.provider || !inputAmount || inputAmount <= 0) return 0;
    
    try {
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, window.wagyDog.provider);
        let path = [];
        let amountIn;
        
        // Get proper addresses with checksum
        let fromAddress = fromToken.isNative ? WBNB_ADDRESS : ethers.getAddress(fromToken.address);
        let toAddress = toToken.isNative ? WBNB_ADDRESS : ethers.getAddress(toToken.address);
        
        if (fromToken.isNative && !toToken.isNative) {
            // BNB to Token
            path = [WBNB_ADDRESS, toAddress];
            amountIn = ethers.parseEther(inputAmount.toString());
        } else if (!fromToken.isNative && toToken.isNative) {
            // Token to BNB
            path = [fromAddress, WBNB_ADDRESS];
            amountIn = ethers.parseUnits(inputAmount.toString(), fromToken.decimals);
        } else if (!fromToken.isNative && !toToken.isNative) {
            // Token to Token (via BNB)
            path = [fromAddress, WBNB_ADDRESS, toAddress];
            amountIn = ethers.parseUnits(inputAmount.toString(), fromToken.decimals);
        } else {
            // Same token type
            return inputAmount;
        }
        
        const amountsOut = await router.getAmountsOut(amountIn, path);
        const outputAmount = parseFloat(ethers.formatUnits(amountsOut[amountsOut.length - 1], toToken.decimals));
        return outputAmount;
    } catch (error) {
        console.error('Failed to calculate output amount:', error);
        return 0;
    }
};

const handleAmountChange = async (e) => {
    const inputAmount = parseFloat(e.target.value);
    
    if (isNaN(inputAmount) || inputAmount <= 0) {
        if (e.target.id === 'from-amount' && toAmountInput) toAmountInput.value = '';
        if (e.target.id === 'to-amount' && fromAmountInput) fromAmountInput.value = '';
        return;
    }
    
    if (e.target.id === 'from-amount' && toAmountInput) {
        const outputAmount = await calculateOutputAmount(inputAmount);
        toAmountInput.value = outputAmount > 0 ? outputAmount.toFixed(6) : '';
    }
    // Note: We don't handle reverse calculation (to-amount input) for now
    // as it requires more complex inverse calculations
};

export const performSwap = async () => {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Please connect your wallet to perform a swap.');
        connectWallet();
        return;
    }
    
    const fromAmount = fromAmountInput ? parseFloat(fromAmountInput.value) : 0;
    if (!fromAmount || fromAmount <= 0) {
        alert('Please enter a valid amount to swap.');
        return;
    }
    
    // Validate that we're not swapping the same token
    if (fromToken.address === toToken.address) {
        alert('Cannot swap the same token. Please select different tokens.');
        return;
    }
    
    try {
        swapActionButton.disabled = true;
        swapActionButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Swapping...';
        if (swapStatus) {
            swapStatus.classList.remove('hidden');
            swapStatus.style.color = '#3B82F6';
            swapStatus.textContent = 'Preparing swap...';
        }
        
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
        
        let path = [];
        let amountIn;
        let tx;
        
        // Validate addresses and determine swap path
        let fromAddress = fromToken.isNative ? WBNB_ADDRESS : fromToken.address;
        let toAddress = toToken.isNative ? WBNB_ADDRESS : toToken.address;
        
        // Ensure addresses are valid checksums
        try {
            fromAddress = ethers.getAddress(fromAddress);
            toAddress = ethers.getAddress(toAddress);
        } catch (error) {
            throw new Error(`Invalid token address: ${error.message}`);
        }
        
        // Determine swap path and amount
        if (fromToken.isNative && !toToken.isNative) {
            // BNB to Token
            path = [WBNB_ADDRESS, toAddress];
            amountIn = ethers.parseEther(fromAmount.toString());
        } else if (!fromToken.isNative && toToken.isNative) {
            // Token to BNB
            path = [fromAddress, WBNB_ADDRESS];
            amountIn = ethers.parseUnits(fromAmount.toString(), fromToken.decimals);
        } else if (!fromToken.isNative && !toToken.isNative) {
            // Token to Token (via BNB)
            path = [fromAddress, WBNB_ADDRESS, toAddress];
            amountIn = ethers.parseUnits(fromAmount.toString(), fromToken.decimals);
        } else {
            throw new Error('Cannot swap same token type');
        }
        
        // Get expected output amount with slippage protection
        if (swapStatus) swapStatus.textContent = 'Calculating best price...';
        const amountsOut = await router.getAmountsOut(amountIn, path);
        const expectedOutput = amountsOut[amountsOut.length - 1];
        const slippageTolerance = 2; // 2% slippage tolerance
        const amountOutMin = expectedOutput * BigInt(100 - slippageTolerance) / 100n;
        
        // Check user balance
        if (fromToken.isNative) {
            const balance = await signer.getBalance();
            if (balance < amountIn) {
                throw new Error(`Insufficient ${fromToken.symbol} balance`);
            }
        } else {
            const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
            const balance = await tokenContract.balanceOf(address);
            if (balance < amountIn) {
                throw new Error(`Insufficient ${fromToken.symbol} balance`);
            }
        }
        
        // Execute swap based on token types with proper transaction signing
        if (fromToken.isNative && !toToken.isNative) {
            // BNB to Token
            if (swapStatus) swapStatus.textContent = 'Preparing BNB to token swap...';
            
            const txRequest = {
                to: ROUTER_ADDRESS,
                value: amountIn,
                data: router.interface.encodeFunctionData('swapExactETHForTokens', [
                    amountOutMin,
                    path,
                    address,
                    deadline
                ]),
                gasLimit: 300000
            };
            
            tx = await window.wagyDog.signTransaction(txRequest);
            
        } else if (!fromToken.isNative && toToken.isNative) {
            // Token to BNB - need approval first
            const tokenContract = new ethers.Contract(fromAddress, ERC20_ABI, signer);
            const allowance = await tokenContract.allowance(address, ROUTER_ADDRESS);
            
            if (allowance < amountIn) {
                if (swapStatus) swapStatus.textContent = 'Approving tokens for swap...';
                
                const approveRequest = {
                    to: fromAddress,
                    data: tokenContract.interface.encodeFunctionData('approve', [ROUTER_ADDRESS, amountIn]),
                    gasLimit: 100000
                };
                
                await window.wagyDog.signTransaction(approveRequest);
            }
            
            if (swapStatus) swapStatus.textContent = 'Swapping tokens for BNB...';
            
            const txRequest = {
                to: ROUTER_ADDRESS,
                data: router.interface.encodeFunctionData('swapExactTokensForETH', [
                    amountIn,
                    amountOutMin,
                    path,
                    address,
                    deadline
                ]),
                gasLimit: 300000
            };
            
            tx = await window.wagyDog.signTransaction(txRequest);
            
        } else {
            // Token to Token - need approval first
            const tokenContract = new ethers.Contract(fromAddress, ERC20_ABI, signer);
            const allowance = await tokenContract.allowance(address, ROUTER_ADDRESS);
            
            if (allowance < amountIn) {
                if (swapStatus) swapStatus.textContent = 'Approving tokens for swap...';
                
                const approveRequest = {
                    to: fromAddress,
                    data: tokenContract.interface.encodeFunctionData('approve', [ROUTER_ADDRESS, amountIn]),
                    gasLimit: 100000
                };
                
                await window.wagyDog.signTransaction(approveRequest);
            }
            
            if (swapStatus) swapStatus.textContent = 'Swapping tokens...';
            
            const txRequest = {
                to: ROUTER_ADDRESS,
                data: router.interface.encodeFunctionData('swapExactTokensForTokens', [
                    amountIn,
                    amountOutMin,
                    path,
                    address,
                    deadline
                ]),
                gasLimit: 350000
            };
            
            tx = await window.wagyDog.signTransaction(txRequest);
        }
        
        // Transaction is already confirmed by signTransaction function
        const receipt = tx; // tx is already the receipt from signTransaction
        
        if (swapStatus) {
            swapStatus.style.color = '#10B981';
            swapStatus.innerHTML = `Swap successful! <a href="https://testnet.bscscan.com/tx/${receipt.hash}" target="_blank" class="underline">View on BSCScan</a>`;
        }
        
        // Clear input fields
        if (fromAmountInput) fromAmountInput.value = '';
        if (toAmountInput) toAmountInput.value = '';
        
        // Show success message
        alert(`Swap completed successfully!\nTransaction: ${receipt.hash}\nView on BSCScan: https://testnet.bscscan.com/tx/${receipt.hash}`);
        
        // Refresh prices
        fetchTokenPrices();
        
    } catch (error) {
        console.error('Swap failed:', error);
        
        let errorMessage = error.message;
        if (error.code === 4001) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
            errorMessage = 'Price impact too high. Try reducing amount or increasing slippage tolerance.';
        } else if (error.message.includes('EXPIRED')) {
            errorMessage = 'Transaction expired. Please try again.';
        }
        
        if (swapStatus) {
            swapStatus.style.color = '#EF4444';
            swapStatus.textContent = `Swap failed: ${errorMessage}`;
        }
        
        if (error.code !== 4001) {
            alert(`Swap failed: ${errorMessage}`);
        }
    } finally {
        swapActionButton.disabled = false;
        swapActionButton.innerHTML = 'Swap';
        setTimeout(() => { 
            if (swapStatus) swapStatus.classList.add('hidden'); 
        }, 10000);
    }
};

// Token Selector Modal (unchanged from previous)
const tokenModal = document.getElementById('token-modal');
const closeTokenModal = document.getElementById('close-token-modal');
const tokenSearch = document.getElementById('token-search');
const tokenList = document.getElementById('token-list');
let selectedModalType = null;

const openTokenModal = (type) => {
    selectedModalType = type;
    tokenModal.classList.remove('hidden');
};

const closeModal = () => {
    tokenModal.classList.add('hidden');
    tokenSearch.value = '';
    tokenList.innerHTML = '';
};

const fetchTokenByAddress = async (address) => {
    if (!window.wagyDog.provider) return null;
    const contract = new ethers.Contract(address, ERC20_ABI, window.wagyDog.provider);
    try {
        const [name, symbol, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals()
        ]);
        return { name: await name, symbol: await symbol, address, decimals: Number(await decimals), logo: 'https://placehold.co/48x48/0d1117/FFFFFF?text=' + (await symbol) };
    } catch (error) {
        console.error('Invalid token address');
        return null;
    }
};

const searchTokens = async (query) => {
    if (query.startsWith('0x') && query.length === 42) {
        const token = await fetchTokenByAddress(query);
        if (token) {
            tokenList.innerHTML = `<div class="token-item p-2 border rounded cursor-pointer hover:bg-gray-100" onclick="selectToken('${selectedModalType}', '${JSON.stringify(token).replace(/"/g, '&quot;')}')">
                <div class="flex items-center">
                    <img src="${token.logo}" class="w-8 h-8 rounded mr-3" onerror="this.src='https://placehold.co/32x32/0d1117/FFFFFF?text=${token.symbol}'">
                    <div>
                        <div class="font-bold">${token.name}</div>
                        <div class="text-gray-500">${token.symbol}</div>
                    </div>
                </div>
            </div>`;
        } else {
            tokenList.innerHTML = '<p class="text-red-500">Invalid token address or not available on BSC Testnet</p>';
        }
        return;
    }
    
    // Filter from our TOKENS array
    const filtered = TOKENS.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) || 
        t.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length === 0) {
        tokenList.innerHTML = '<p class="text-gray-500">No tokens found</p>';
        return;
    }
    
    tokenList.innerHTML = filtered.map(t => `
        <div class="token-item p-2 border rounded cursor-pointer hover:bg-gray-100 transition-colors" onclick="selectToken('${selectedModalType}', '${JSON.stringify(t).replace(/"/g, '&quot;')}')">
            <div class="flex items-center">
                <img src="${t.logo}" class="w-8 h-8 rounded mr-3" onerror="this.src='https://placehold.co/32x32/0d1117/FFFFFF?text=${t.symbol}'">
                <div class="flex-1">
                    <div class="font-bold text-gray-900">${t.name}</div>
                    <div class="text-gray-500 text-sm">${t.symbol}</div>
                </div>
                ${currentPrices[t.address] ? `<div class="text-right text-sm text-gray-600">
                    $${currentPrices[t.address].toFixed(6)}
                </div>` : ''}
            </div>
        </div>
    `).join('');
};

window.selectToken = (type, tokenData) => {
    const token = JSON.parse(tokenData.replace(/&quot;/g, '"'));
    if (type === 'from') {
        fromToken = token;
        updateTokenDisplay(fromTokenSelect, token);
    } else {
        toToken = token;
        updateTokenDisplay(toTokenSelect, token);
    }
    closeModal();
};

tokenSearch.addEventListener('input', (e) => searchTokens(e.target.value));
closeTokenModal.addEventListener('click', closeModal);
tokenModal.addEventListener('click', (e) => { if (e.target === tokenModal) closeModal(); });

// Select button listeners
fromTokenSelect.addEventListener('click', () => openTokenModal('from'));
toTokenSelect.addEventListener('click', () => openTokenModal('to'));

if (swapDirectionBtn) swapDirectionBtn.addEventListener('click', handleSwapDirection);
if (fromAmountInput) fromAmountInput.addEventListener('input', handleAmountChange);
if (toAmountInput) toAmountInput.addEventListener('input', handleAmountChange);
if (swapActionButton) swapActionButton.addEventListener('click', performSwap);

// Initialize swap interface
const initializeSwap = async () => {
    updateTokenDisplay(fromTokenSelect, fromToken);
    updateTokenDisplay(toTokenSelect, toToken);
    
    // Show all tokens in the modal initially
    searchTokens('');
    
    // Start price fetching if wallet is connected
    if (window.wagyDog.provider) {
        await fetchTokenPrices();
        
        // Update prices every 30 seconds
        priceUpdateInterval = setInterval(fetchTokenPrices, 30000);
    }
    
    console.log('Swap UI initialized with PancakeSwap integration');
};

// Listen for wallet connection changes
window.addEventListener('walletConnected', async () => {
    await fetchTokenPrices();
    if (!priceUpdateInterval) {
        priceUpdateInterval = setInterval(fetchTokenPrices, 30000);
    }
});

window.addEventListener('walletDisconnected', () => {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
        priceUpdateInterval = null;
    }
    currentPrices = {};
    updateExchangeRate();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSwap);
} else {
    initializeSwap();
}
