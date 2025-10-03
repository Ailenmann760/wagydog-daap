import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config.js';
import { connectWallet } from './wallet.js';

const mintBtn = document.getElementById('mint-nft-btn');
const nftGallery = document.getElementById('nft-gallery');

// IPFS Client
const { create } = window.IpfsHttpClient;
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

const dummyNfts = [
    { id: 1, name: 'Cosmic Wagy', artist: 'Galaxy Paws', price: '0.1', image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 2, name: 'Nebula Pup', artist: 'Starlight Studio', price: '0.25', image: 'https://images.pexels.com/photos/1665241/pexels-photo-1665241.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 3, name: 'Star Chaser', artist: 'Andromeda Art', price: '0.5', image: 'https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

const createNftCard = (nft, isListed = false, price = 0) => `
    <div class="nft-card">
        <img src="${nft.image}" alt="${nft.name}" class="nft-card-image" onerror="this.src='https://placehold.co/250x250/0d1117/FFFFFF?text=NFT+${nft.id}'">
        <div class="nft-card-content">
            <h4 class="nft-card-title">${nft.name} #${nft.id}</h4>
            <p class="nft-card-artist">by ${nft.artist}</p>
        </div>
        <div class="nft-card-footer">
            <span class="text-sm text-gray-400">Price</span>
            <span class="font-bold text-white">${isListed ? price + ' BNB' : 'Not Listed'}</span>
            ${isListed ? `<button class="btn-primary ml-2 text-xs" onclick="buyNFT(${nft.id})">Buy NFT</button>` : `<button class="btn-secondary ml-2 text-xs" onclick="listNFT(${nft.id})">List for Sale</button>`}
        </div>
    </div>
`;

export const renderNfts = () => {
    if (nftGallery) {
        nftGallery.innerHTML = dummyNfts.map(nft => createNftCard(nft)).join('');
        console.log('NFT gallery populated with 3 dummies');
    } else {
        console.warn('NFT gallery element not found');
    }
};

async function uploadAndMintNFT() {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Connect wallet first.');
        connectWallet();
        return;
    }
    const fileInput = document.getElementById('artwork-upload');
    const name = document.getElementById('nft-name').value;
    const desc = document.getElementById('nft-desc').value;
    if (!fileInput.files[0] || !name || !desc) {
        alert('Provide image, name, and description.');
        return;
    }
    try {
        const uploadMintBtn = document.getElementById('upload-mint-btn');
        uploadMintBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Uploading...';
        // Upload image
        const imageAdded = await ipfs.add(fileInput.files[0]);
        const imageUri = `https://ipfs.io/ipfs/${imageAdded.cid.toString()}`;
        // Metadata
        const metadata = { name, description: desc, image: imageUri };
        const metadataAdded = await ipfs.add(new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        const tokenUri = `https://ipfs.io/ipfs/${metadataAdded.cid.toString()}`;
        // Mint (assume contract mints with URI; adjust if needed)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const mintPrice = await contract.MINT_PRICE();
        const tx = await contract.mint(address, { value: mintPrice }); // Pass URI if contract supports
        await tx.wait();
        alert('NFT minted and uploaded to IPFS!');
        renderNfts();
    } catch (error) {
        console.error('Upload/Mint failed:', error);
        alert(`Failed: ${error.message}`);
    } finally {
        const uploadMintBtn = document.getElementById('upload-mint-btn');
        uploadMintBtn.innerHTML = 'Upload & Mint NFT';
    }
}

window.listNFT = async (tokenId) => {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) return alert('Connect wallet.');
    const price = prompt('List price in BNB:');
    if (!price) return;
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.listNFT(tokenId, ethers.parseEther(price));
        await tx.wait();
        alert('NFT listed!');
        renderNfts();
    } catch (error) {
        alert(`List failed: ${error.message}`);
    }
};

window.buyNFT = async (tokenId) => {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) return alert('Connect wallet.');
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const price = await contract.getListingPrice(tokenId);
        const tx = await contract.buyNFT(tokenId, { value: price });
        await tx.wait();
        alert('NFT bought!');
        renderNfts();
    } catch (error) {
        alert(`Buy failed: ${error.message}`);
    }
};

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
        mintBtn.disabled = true;
        mintBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        const tx = await contract.mint(address, { value: mintPrice });
        await tx.wait();
        alert('Mint successful! Check your wallet.');
        renderNfts();
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
