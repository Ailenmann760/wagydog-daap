import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config.js';
import { connectWallet } from './wallet.js';

const mintBtn = document.getElementById('mint-nft-btn');
const nftGallery = document.getElementById('nft-gallery');

const dummyNfts = [
    { id: 1, name: 'Cosmic Wagy', artist: 'Galaxy Paws', price: '0.1', image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 2, name: 'Nebula Pup', artist: 'Starlight Studio', price: '0.25', image: 'https://images.pexels.com/photos/1665241/pexels-photo-1665241.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 3, name: 'Star Chaser', artist: 'Andromeda Art', price: '0.5', image: 'https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

const createNftCard = (nft) => `
    <div class="nft-card">
        <img src="${nft.image}" alt="${nft.name}" class="nft-card-image" onerror="this.src='https://via.placeholder.com/250x250?text=NFT+${nft.id}'">
        <div class="nft-card-content">
            <h4 class="nft-card-title">${nft.name} #${nft.id}</h4>
            <p class="nft-card-artist">by ${nft.artist}</p>
        </div>
        <div class="nft-card-footer">
            <span class="text-sm text-gray-400">Price</span>
            <span class="font-bold text-white">${nft.price} BNB</span>
        </div>
    </div>
`;

// Render dummies on init
export const renderNfts = () => {
    if (nftGallery) {
        nftGallery.innerHTML = dummyNfts.map(createNftCard).join('');
        console.log('NFT gallery populated with 3 dummies');
    } else {
        console.warn('NFT gallery element not found');
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
        // Refresh gallery (static dummies, but in real: query balanceOf and ownerOf)
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
