import { ROUTER_ADDRESS, ROUTER_ABI, ERC20_ABI, WAGY_ADDRESS, WBNB_ADDRESS, TOKENS } from './config.js';
import { connectWallet } from './wallet.js';

const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromTokenSelect = document.getElementById('from-token-select');
const toTokenSelect = document.getElementById('to-token-select');
const swapDirectionBtn = document.getElementById('swap-direction-btn');
const swapActionButton = document.getElementById('swap-action-btn');
const swapStatus = document.getElementById('swap-status');

let fromToken = TOKENS[0];
let toToken = TOKENS[1] || { name: 'Token', symbol: 'TKN', address: WBNB_ADDRESS, logo: 'https://placehold.co/48x48/0d1117/FFFFFF?text=TKN', decimals: 18 };

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

const quoteFromRouter = async (amountInFloat) => {
    try {
        const { provider } = window.wagyDog.getWalletState();
        const readProvider = provider || new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, readProvider);
        const path = fromToken.address === WBNB_ADDRESS ? [WBNB_ADDRESS, toToken.address] : [fromToken.address, WBNB_ADDRESS, toToken.address];
        const amountIn = ethers.parseUnits(amountInFloat.toString(), fromToken.decimals || 18);
        const amounts = await router.getAmountsOut(amountIn, path);
        const out = amounts[amounts.length - 1];
        return ethers.formatUnits(out, toToken.decimals || 18);
    } catch (e) {
        console.warn('Quote failed', e);
        return '';
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
        toAmountInput.value = '...';
        const quoted = await quoteFromRouter(inputAmount);
        toAmountInput.value = quoted ? Number(quoted).toFixed(6) : '';
    } else if (fromAmountInput) {
        // reverse quote is approximate; request small binary search if needed; here keep simple
        fromAmountInput.value = e.target.value;
        const quoted = await quoteFromRouter(parseFloat(fromAmountInput.value || '0'));
        if (quoted) toAmountInput.value = Number(quoted).toFixed(6);
    }
};

export const performSwap = async () => {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) {
        alert('Please connect your wallet to perform a swap.');
        connectWallet();
        return;
    }
    const fromAmount = fromAmountInput ? parseFloat(fromAmountInput.value) : 0;
    if (!fromAmount || fromAmount <= 0) {
        alert('Please enter a valid amount to swap.');
        return;
    }
    try {
        swapActionButton.disabled = true;
        swapActionButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Swapping...';
        if (swapStatus) swapStatus.classList.remove('hidden');
        if (swapStatus) swapStatus.textContent = 'Executing swap...';
        if (fromToken.address === toToken.address) {
            alert('Select two different tokens.');
            return;
        }
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min
        const isFromBNB = fromToken.address.toLowerCase() === WBNB_ADDRESS.toLowerCase();
        const isToBNB = toToken.address.toLowerCase() === WBNB_ADDRESS.toLowerCase();
        let path;
        if (isFromBNB && !isToBNB) {
            path = [WBNB_ADDRESS, toToken.address];
        } else if (!isFromBNB && isToBNB) {
            path = [fromToken.address, WBNB_ADDRESS];
        } else if (!isFromBNB && !isToBNB) {
            path = [fromToken.address, WBNB_ADDRESS, toToken.address];
        } else {
            // BNB -> BNB not allowed
            alert('Invalid path');
            return;
        }
        const amountIn = isFromBNB ? ethers.parseEther(fromAmount.toString()) : ethers.parseUnits(fromAmount.toString(), fromToken.decals || fromToken.decimals || 18);
        // Get expected out with 0.5% slippage
        const amountsOut = await router.getAmountsOut(amountIn, path);
        const amountOutMin = amountsOut[amountsOut.length - 1] * 995n / 1000n; // 0.5% slippage
        let tx;
        if (isFromBNB) {
            tx = await router.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value: amountIn, gasLimit: 500000 });
        } else if (isToBNB) {
            const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
            const allowance = await tokenContract.allowance(signer.address, ROUTER_ADDRESS);
            if (allowance < amountIn) {
                if (swapStatus) swapStatus.textContent = 'Approving tokens...';
                const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn, { gasLimit: 100000 });
                await approveTx.wait();
            }
            tx = await router.swapExactTokensForETH(amountIn, amountOutMin, path, signer.address, deadline, { gasLimit: 500000 });
        } else {
            const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
            const allowance = await tokenContract.allowance(signer.address, ROUTER_ADDRESS);
            if (allowance < amountIn) {
                if (swapStatus) swapStatus.textContent = 'Approving tokens...';
                const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn, { gasLimit: 100000 });
                await approveTx.wait();
            }
            tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, path, signer.address, deadline, { gasLimit: 500000 });
        }
        const receipt = await tx.wait();
        if (swapStatus) swapStatus.textContent = 'Swap successful! Tx: ' + receipt.hash;
        alert('Swap complete! Tx: ' + receipt.hash);
    } catch (error) {
        console.error('Swap failed:', error);
        if (swapStatus) swapStatus.textContent = 'Swap failed: ' + error.message;
        alert(`Swap failed: ${error.message}. Check path, funds, or slippage.`);
    } finally {
        swapActionButton.disabled = false;
        swapActionButton.innerHTML = 'Swap';
        setTimeout(() => { if (swapStatus) swapStatus.classList.add('hidden'); }, 5000);
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
            tokenList.innerHTML = `<div class="token-item p-2 border rounded cursor-pointer" onclick="selectToken('${selectedModalType}', '${JSON.stringify(token).replace(/"/g, '&quot;')}')">
                <div class="flex items-center">
                    <img src="${token.logo}" class="w-8 h-8 rounded mr-3">
                    <div>
                        <div class="font-bold">${token.name}</div>
                        <div class="text-gray-500">${token.symbol}</div>
                    </div>
                </div>
            </div>`;
        } else {
            tokenList.innerHTML = '<p class="text-red-500">Invalid token address</p>';
        }
        return;
    }
    const popularTokens = TOKENS;
    const filtered = popularTokens.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.symbol.toLowerCase().includes(query.toLowerCase()));
    tokenList.innerHTML = filtered.map(t => `
        <div class="token-item p-2 border rounded cursor-pointer hover:bg-gray-100" onclick="selectToken('${selectedModalType}', '${JSON.stringify(t).replace(/"/g, '&quot;')}')">
            <div class="flex items-center">
                <img src="${t.logo}" class="w-8 h-8 rounded mr-3" onerror="this.src='https://placehold.co/32x32/0d1117/FFFFFF?text=${t.symbol}'">
                <div>
                    <div class="font-bold">${t.name}</div>
                    <div class="text-gray-500">${t.symbol}</div>
                </div>
            </div>
        </div>
    `).join('') || '<p class="text-gray-500">No tokens found</p>';
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

// Init
updateTokenDisplay(fromTokenSelect, fromToken);
updateTokenDisplay(toTokenSelect, toToken);
console.log('Swap UI initialized with token selector');
