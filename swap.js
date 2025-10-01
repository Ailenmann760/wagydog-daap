const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromTokenSelect = document.getElementById('from-token-select');
const toTokenSelect = document.getElementById('to-token-select');
const swapDirectionBtn = document.getElementById('swap-direction-btn');
const swapActionButton = document.getElementById('swap-action-btn');

let fromToken = { name: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' };
let toToken = { name: 'WAGY', logo: 'https://img.icons8.com/color/48/shiba.png' };
const BNB_TO_WAGY_RATE = 1500000;

const updateTokenDisplay = (buttonElement, token) => {
    if (!buttonElement) {
        console.warn('Token select element not found');
        return;
    }
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
        toAmountInput.value = (inputAmount * rate).toFixed(2);
    } else if (fromAmountInput) {
        fromAmountInput.value = (inputAmount / rate).toFixed(6);
    }
};

export const performSwap = async () => {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) {
        alert('Please connect your wallet to perform a swap.');
        return;
    }
    const fromAmount = fromAmountInput ? fromAmountInput.value : '';
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
        alert('Please enter a valid amount to swap.');
        return;
    }
    alert("Swap functionality is a simulation for now. In production, integrate with PancakeSwap router.");
    // Real: Use ethers to call swapExactTokensForTokens on router contract
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
