import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config.js';
import { connectWallet } from './wallet.js';

const mintBtn = document.getElementById('mint-nft-btn');
const nftGallery = document.getElementById('nft-gallery');
const uploadMintBtn = document.getElementById('upload-mint-btn');

// IPFS Client
const { create } = window.IpfsHttpClient;
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

const dummyNfts = [
    { id: 1, name: 'Cosmic Wagy', artist: 'Galaxy Paws', price: '0.1', image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 2, name: 'Nebula Pup', artist: 'Starlight Studio', price: '0.25', image: 'https://images.pexels.com/photos/1665241/pexels-photo-1665241.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 3, name: 'Star Chaser', artist: 'Andromeda Art', price: '0.5', image: 'https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

const createNftCard = (nft, isListed = false, price = 0) => `
    <div class="nft-card border border-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">
        <img src="${nft.image}" alt="${nft.name}" class="w-full h-64 object-cover">
        <div class="p-4">
            <h4 class="text-lg font-bold">${nft.name} #${nft.id}</h4>
            <p class="text-gray-600 text-sm">${nft.artist}</p>
            <div class="flex justify-between items-center mt-2">
                <span class="text-gray-500 text-sm">Price</span>
                <span class="font-bold text-blue-600">${isListed ? price + ' BNB' : 'Not Listed'}</span>
            </div>
            ${isListed ? `<button class="btn-primary text-xs px-3 py-1 mt-2" onclick="buyNFT(${nft.id})">Buy</button>` : `<button class="btn-secondary text-xs px-3 py-1 mt-2" onclick="listNFT(${nft.id})">List for Sale</button>`}
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
        renderNfts();
    } catch (error) {
        console.error('Upload/Mint failed:', error);
        alert(`Failed: ${error.message}. Check funds/gas.`);
    } finally {
        uploadMintBtn.innerHTML = 'Create & Mint';
    }
}

window.listNFT = async (tokenId) => {
    const { signer } = window.wagyDog.getWalletState();
    if (!signer) return alert('Connect wallet.');
    const price = prompt('List price in BNB:');
    if (!price) return;
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.listNFT(tokenId, ethers.parseEther(price), { gasLimit: 200000 });
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
        const tx = await contract.buyNFT(tokenId, { value: price, gasLimit: 300000 });
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
        const balance = await signer.getBalance();
        if (balance < mintPrice) {
            throw new Error('Insufficient BNB for mint');
        }
        mintBtn.disabled = true;
        mintBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        const defaultUri = 'https://placehold.co/250x250/0d1117/FFFFFF?text=WagyDog';
        const tx = await contract.mint(address, { value: mintPrice, gasLimit: 300000 });
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
