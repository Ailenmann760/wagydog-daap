import { ROUTER_ADDRESS, ROUTER_ABI, ERC20_ABI, WAGY_ADDRESS } from './config.js';
import { connectWallet } from './wallet.js';

const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromTokenSelect = document.getElementById('from-token-select');
const toTokenSelect = document.getElementById('to-token-select');
const swapDirectionBtn = document.getElementById('swap-direction-btn');
const swapActionButton = document.getElementById('swap-action-btn');
const swapStatus = document.getElementById('swap-status');

let fromToken = { name: 'BNB', address: ethers.ZeroAddress, logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' };
let toToken = { name: 'WAGY', address: WAGY_ADDRESS, logo: 'wagydog-logo.png' };
const BNB_TO_WAGY_RATE = 1500000;

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

const handleAmountChange = (e) => {
    const inputAmount = parseFloat(e.target.value);
    if (isNaN(inputAmount) || inputAmount <= 0) {
        if (e.target.id === 'from-amount' && toAmountInput) toAmountInput.value = '';
        if (e.target.id === 'to-amount' && fromAmountInput) fromAmountInput.value = '';
        return;
    }
    const rate = (fromToken.name === 'BNB') ? BNB_TO_WAGY_RATE : 1 / BNB_TO_WAGY_RATE;
    if (e.target.id === 'from-amount' && toAmountInput) {
        toAmountInput.value = (inputAmount * rate).toFixed(6);
    } else if (fromAmountInput) {
        fromAmountInput.value = (inputAmount / rate).toFixed(6);
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
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        const wagyContract = new ethers.Contract(WAGY_ADDRESS, ERC20_ABI, signer);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins
        const path = fromToken.address === ethers.ZeroAddress ? [fromToken.address, toToken.address] : [fromToken.address, toToken.address];
        let tx;
        if (fromToken.name === 'BNB') { // ETH (BNB) to Tokens
            tx = await router.swapExactETHForTokens(0, path, signer.address, deadline, { value: ethers.parseEther(fromAmount.toString()) });
        } else { // Tokens to ETH (BNB)
            const amountIn = ethers.parseUnits(fromAmount.toString(), 18); // Assume 18 decimals
            const allowance = await wagyContract.allowance(signer.address, ROUTER_ADDRESS);
            if (allowance < amountIn) {
                if (swapStatus) swapStatus.textContent = 'Approving tokens...';
                const approveTx = await wagyContract.approve(ROUTER_ADDRESS, amountIn);
                await approveTx.wait();
            }
            tx = await router.swapExactTokensForETH(amountIn, 0, path, signer.address, deadline);
        }
        await tx.wait();
        if (swapStatus) swapStatus.textContent = 'Swap successful!';
        alert("Swap functionality is a simulation for now. In production, integrate with PancakeSwap router.");
    } catch (error) {
        console.error('Swap failed:', error);
        if (swapStatus) swapStatus.textContent = 'Swap failed: ' + error.message;
        alert(`Swap failed: ${error.message}`);
    } finally {
        swapActionButton.disabled = false;
        swapActionButton.innerHTML = 'Swap';
        setTimeout(() => { if (swapStatus) swapStatus.classList.add('hidden'); }, 5000);
    }
};

if (swapDirectionBtn) {
    swapDirectionBtn.addEventListener('click', handleSwapDirection);
}
if (fromAmountInput) {
    fromAmountInput.addEventListener('input', handleAmountChange);
}
if (toAmountInput) {
    toAmountInput.addEventListener('input', handleAmountChange);
}
if (swapActionButton) {
    swapActionButton.addEventListener('click', performSwap);
}

// Init displays
if (fromTokenSelect) updateTokenDisplay(fromTokenSelect, fromToken);
if (toTokenSelect) updateTokenDisplay(toTokenSelect, toToken);
console.log('Swap UI initialized');
