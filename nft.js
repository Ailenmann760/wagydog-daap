import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config.js';
import { connectWallet } from './wallet.js';

const mintBtn = document.getElementById('mint-nft-btn');
const nftGallery = document.getElementById('nft-gallery');
const uploadMintBtn = document.getElementById('upload-mint-btn');
const filterSelect = document.getElementById('nft-filter');
const refreshBtn = document.getElementById('refresh-nfts');

// IPFS Client
const { create } = window.IpfsHttpClient;
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

let cachedNfts = [];

const createNftCard = (nft) => `
    <div class="nft-card rounded-lg overflow-hidden hover:shadow-xl transition-shadow bg-white/5">
        <img src="${nft.image}" alt="${nft.name}" class="w-full h-64 object-cover" onerror="this.src='https://placehold.co/400x400/0d1117/FFFFFF?text=NFT'">
        <div class="p-4">
            <h4 class="text-lg font-bold text-white">${nft.name} #${nft.id}</h4>
            <p class="text-gray-400 text-sm">${nft.ownerShort}</p>
            <div class="flex justify-between items-center mt-2">
                <span class="text-gray-400 text-sm">Status</span>
                <span class="font-bold ${nft.listed ? 'text-green-400' : 'text-amber-300'}">${nft.listed ? `${nft.price} BNB` : 'Not Listed'}</span>
            </div>
            ${nft.listed ? `<button class="btn-primary text-xs px-3 py-1 mt-2" onclick="buyNFT(${nft.id})">Buy</button>` : nft.isMine ? `<button class="btn-secondary text-xs px-3 py-1 mt-2" onclick="listNFT(${nft.id})">List for Sale</button>` : ''}
        </div>
    </div>
`;

const getReadProvider = () => {
    const { provider } = window.wagyDog.getWalletState();
    return provider || new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
};

const getContract = (signerOrProvider) => new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider || getReadProvider());

async function fetchAllNfts() {
    try {
        const readProvider = getReadProvider();
        const contract = getContract(readProvider);
        const totalSupply = Number(await contract.totalSupply());
        const { address } = window.wagyDog.getWalletState();
        const items = [];
        for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
            try {
                const [owner, uri] = await Promise.all([
                    contract.ownerOf(tokenId),
                    contract.tokenURI(tokenId)
                ]);
                let meta = { name: 'WagyDog', image: '', description: '' };
                try {
                    const res = await fetch(uri);
                    meta = await res.json();
                } catch (e) { /* ignore */ }
                let priceWei = 0n;
                try {
                    priceWei = await contract.getListingPrice(tokenId);
                } catch (e) { /* ignore */ }
                const listed = priceWei && priceWei > 0n;
                const item = {
                    id: tokenId,
                    name: meta.name || `WagyDog`,
                    image: meta.image || 'https://placehold.co/400x400/0d1117/FFFFFF?text=WAGY',
                    owner: owner,
                    ownerShort: owner.slice(0, 6) + '...' + owner.slice(-4),
                    listed,
                    price: listed ? Number(ethers.formatEther(priceWei)).toString() : '0',
                    isMine: address ? owner.toLowerCase() === address.toLowerCase() : false
                };
                items.push(item);
            } catch (e) {
                console.warn('NFT fetch failed for token', tokenId, e);
            }
        }
        cachedNfts = items;
        return items;
    } catch (e) {
        console.error('Failed loading NFTs', e);
        return [];
    }
}

export const renderNfts = async () => {
    if (!nftGallery) return;
    nftGallery.innerHTML = '<div class="text-center text-gray-400">Loading NFTs...</div>';
    if (cachedNfts.length === 0) await fetchAllNfts();
    const filter = (filterSelect && filterSelect.value) || 'all';
    const { address } = window.wagyDog.getWalletState();
    const filtered = cachedNfts.filter(n => {
        if (filter === 'listed') return n.listed;
        if (filter === 'mine') return address && n.owner.toLowerCase() === address.toLowerCase();
        return true;
    });
    nftGallery.innerHTML = filtered.map(nft => createNftCard(nft)).join('') || '<div class="text-center text-gray-400">No NFTs yet.</div>';
};

// OpenSea-Style Upload Preview
document.getElementById('artwork-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

export async function uploadAndMintNFT() {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Connect wallet first.');
        connectWallet();
        return;
    }
    const fileInput = document.getElementById('artwork-upload');
    const name = document.getElementById('nft-name').value;
    const desc = document.getElementById('nft-desc').value;
    const initialPrice = document.getElementById('nft-price').value;
    if (!fileInput.files[0] || !name || !desc) {
        alert('Provide image, name, and description.');
        return;
    }
    try {
        uploadMintBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating...';
        // Upload image
        const imageAdded = await ipfs.add(fileInput.files[0]);
        const imageUri = `https://ipfs.io/ipfs/${imageAdded.cid.toString()}`;
        // Metadata
        const metadata = { name, description: desc, image: imageUri };
        const metadataAdded = await ipfs.add(new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        const tokenUri = `https://ipfs.io/ipfs/${metadataAdded.cid.toString()}`;
        // Get next tokenId
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const currentSupply = await contract.totalSupply();
        const tokenId = currentSupply + 1n;
        // Check funds
        const mintPrice = await contract.MINT_PRICE();
        const balance = await signer.getBalance();
        if (balance < mintPrice) {
            throw new Error('Insufficient BNB for mint');
        }
        // Mint with URI
        const tx = await contract.safeMint(address, tokenUri, { value: mintPrice, gasLimit: 300000 });
        const receipt = await tx.wait();
        if (initialPrice) {
            const listTx = await contract.listNFT(tokenId, ethers.parseEther(initialPrice), { gasLimit: 200000 });
            await listTx.wait();
        }
        alert('NFT created and minted!');
        // Reset form
        document.getElementById('nft-name').value = '';
        document.getElementById('nft-desc').value = '';
        document.getElementById('nft-price').value = '';
        document.getElementById('preview').classList.add('hidden');
        fileInput.value = '';
        cachedNfts = [];
        await renderNfts();
    } catch (error) {
        console.error('Upload/Mint failed:', error);
        alert(`Failed: ${error.message}. Check funds/gas.`);
    } finally {
        uploadMintBtn.innerHTML = 'Create & Mint';
    }
}

export async function listNFT(tokenId) {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) return alert('Connect wallet.');
    const price = prompt('List price in BNB:');
    if (!price) return;
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.listNFT(tokenId, ethers.parseEther(price), { gasLimit: 200000 });
        await tx.wait();
        alert('NFT listed!');
        cachedNfts = [];
        await renderNfts();
    } catch (error) {
        alert(`List failed: ${error.message}`);
    }
}

export async function buyNFT(tokenId) {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) return alert('Connect wallet.');
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const price = await contract.getListingPrice(tokenId);
        const tx = await contract.buyNFT(tokenId, { value: price, gasLimit: 300000 });
        await tx.wait();
        alert('NFT bought!');
        cachedNfts = [];
        await renderNfts();
    } catch (error) {
        alert(`Buy failed: ${error.message}`);
    }
}

export const mintNFT = async () => {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Please connect your wallet first.');
        connectWallet();
        return;
    }
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const mintPrice = await contract.MINT_PRICE();
        const balance = await signer.getBalance();
        if (balance < mintPrice) {
            throw new Error('Insufficient BNB for mint');
        }
        mintBtn.disabled = true;
        mintBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        const defaultUri = 'https://placehold.co/600x600/0d1117/FFFFFF?text=WagyDog';
        const tx = await contract.safeMint(address, defaultUri, { value: mintPrice, gasLimit: 300000 });
        await tx.wait();
        alert('Mint successful! Check your wallet.');
        cachedNfts = [];
        await renderNfts();
    } catch (error) {
        console.error("Minting failed:", error);
        alert(`Minting failed: ${error.message}. Check funds/gas.`);
    } finally {
        mintBtn.disabled = false;
        mintBtn.innerHTML = '<i class="fas fa-star mr-2"></i> Mint Now';
    }
};

if (mintBtn) {
    mintBtn.addEventListener('click', mintNFT);
}

// Filter and refresh
if (filterSelect) {
    filterSelect.addEventListener('change', async () => { await renderNfts(); });
}
if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => { cachedNfts = []; await renderNfts(); });
}

// Expose for inline onclick in cards
window.listNFT = listNFT;
window.buyNFT = buyNFT;
window.uploadAndMintNFT = uploadAndMintNFT;
