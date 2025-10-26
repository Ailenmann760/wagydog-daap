import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config.js';
import { connectWallet } from './wallet.js';

const mintBtn = document.getElementById('mint-nft-btn');
const nftGallery = document.getElementById('nft-gallery');
const uploadMintBtn = document.getElementById('upload-mint-btn');

// IPFS Client
const { create } = window.IpfsHttpClient;
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

// NFT marketplace state
let allNfts = [];
let userNfts = [];
let listedNfts = [];
let currentFilter = 'all'; // 'all', 'owned', 'listed'

const dummyNfts = [
    { 
        id: 1, 
        name: 'Cosmic Wagy', 
        description: 'A mystical WagyDog floating through the cosmos', 
        artist: 'Galaxy Paws', 
        price: '0.1', 
        image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
        owner: '0x0000000000000000000000000000000000000000',
        isListed: false,
        fromContract: false,
        tokenId: 1
    },
    { 
        id: 2, 
        name: 'Nebula Pup', 
        description: 'Young WagyDog exploring distant nebulae', 
        artist: 'Starlight Studio', 
        price: '0.25', 
        image: 'https://images.pexels.com/photos/1665241/pexels-photo-1665241.jpeg?auto=compress&cs=tinysrgb&w=600',
        owner: '0x0000000000000000000000000000000000000000',
        isListed: false,
        fromContract: false,
        tokenId: 2
    },
    { 
        id: 3, 
        name: 'Star Chaser', 
        description: 'Elite WagyDog racing between stars', 
        artist: 'Andromeda Art', 
        price: '0.5', 
        image: 'https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg?auto=compress&cs=tinysrgb&w=600',
        owner: '0x0000000000000000000000000000000000000000',
        isListed: false,
        fromContract: false,
        tokenId: 3
    },
    { 
        id: 4, 
        name: 'Moon Walker', 
        description: 'WagyDog taking its first steps on the lunar surface', 
        artist: 'Lunar Labs', 
        price: '0.15', 
        image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600',
        owner: '0x0000000000000000000000000000000000000000',
        isListed: false,
        fromContract: false,
        tokenId: 4
    },
    { 
        id: 5, 
        name: 'Galaxy Guardian', 
        description: 'Legendary WagyDog protecting the galaxy', 
        artist: 'Cosmic Creators', 
        price: '1.0', 
        image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
        owner: '0x0000000000000000000000000000000000000000',
        isListed: false,
        fromContract: false,
        tokenId: 5
    }
];

const createNftCard = (nft) => {
    const { address } = window.wagyDog.getWalletState();
    const isOwner = address && nft.owner && nft.owner.toLowerCase() === address.toLowerCase();
    const canBuy = address && !isOwner && nft.isListed && nft.fromContract;
    const canList = address && isOwner && !nft.isListed;
    const canUnlist = address && isOwner && nft.isListed;
    
    return `
        <div class="nft-card group cursor-pointer" onclick="openNftModal(${nft.id})">
            <div class="relative overflow-hidden rounded-t-xl">
                <img src="${nft.image}" alt="${nft.name}" class="nft-card-image group-hover:scale-105 transition-transform duration-300">
                ${nft.isListed ? '<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">For Sale</div>' : ''}
                ${isOwner ? '<div class="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">Owned</div>' : ''}
            </div>
            <div class="nft-card-content">
                <div class="nft-card-title">${nft.name} #${nft.tokenId}</div>
                <div class="nft-card-artist">by ${nft.artist}</div>
                <div class="text-gray-300 text-sm mt-1 line-clamp-2">${nft.description}</div>
            </div>
            <div class="nft-card-footer">
                <div class="flex flex-col">
                    <span class="text-gray-400 text-xs">Price</span>
                    <span class="font-bold text-white">
                        ${nft.isListed ? nft.price + ' BNB' : 'Not Listed'}
                    </span>
                </div>
                <div class="flex flex-col gap-1">
                    ${canBuy ? `<button class="btn-primary text-xs px-3 py-1" onclick="event.stopPropagation(); buyNFT(${nft.tokenId}, '${nft.price}')">Buy Now</button>` : ''}
                    ${canList ? `<button class="btn-secondary text-xs px-3 py-1" onclick="event.stopPropagation(); listNFT(${nft.tokenId})">List for Sale</button>` : ''}
                    ${canUnlist ? `<button class="btn-secondary text-xs px-3 py-1" onclick="event.stopPropagation(); unlistNFT(${nft.tokenId})">Remove Listing</button>` : ''}
                </div>
            </div>
        </div>
    `;
};

// Fetch NFTs from contract and combine with dummy data
const fetchNftsFromContract = async () => {
    const { provider, address } = window.wagyDog.getWalletState();
    if (!provider) return [];
    
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const totalSupply = await contract.totalSupply();
        const contractNfts = [];
        
        for (let i = 1; i <= totalSupply; i++) {
            try {
                const owner = await contract.ownerOf(i);
                const tokenURI = await contract.tokenURI(i);
                let listingPrice = 0;
                let isListed = false;
                
                try {
                    listingPrice = await contract.getListingPrice(i);
                    isListed = listingPrice > 0;
                } catch (e) {
                    // Token not listed
                }
                
                // Fetch metadata from IPFS
                let metadata = { name: `WagyDog #${i}`, description: 'A unique WagyDog NFT', image: 'https://placehold.co/400x400/0d1117/FFFFFF?text=WagyDog' };
                try {
                    const response = await fetch(tokenURI);
                    if (response.ok) {
                        metadata = await response.json();
                    }
                } catch (e) {
                    console.warn(`Failed to fetch metadata for token ${i}`);
                }
                
                contractNfts.push({
                    id: i,
                    tokenId: i,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image,
                    artist: 'WagyDog Community',
                    owner: owner,
                    price: isListed ? ethers.formatEther(listingPrice) : '0',
                    isListed: isListed,
                    fromContract: true
                });
            } catch (error) {
                console.warn(`Failed to fetch NFT ${i}:`, error);
            }
        }
        
        return contractNfts;
    } catch (error) {
        console.error('Failed to fetch NFTs from contract:', error);
        return [];
    }
};

// Filter NFTs based on current filter
const getFilteredNfts = (nfts) => {
    const { address } = window.wagyDog.getWalletState();
    
    switch (currentFilter) {
        case 'owned':
            return address ? nfts.filter(nft => nft.owner && nft.owner.toLowerCase() === address.toLowerCase()) : [];
        case 'listed':
            return nfts.filter(nft => nft.isListed);
        case 'all':
        default:
            return nfts;
    }
};

// Main render function
export const renderNfts = async () => {
    if (!nftGallery) {
        console.warn('NFT gallery element not found');
        return;
    }
    
    // Show loading state
    nftGallery.innerHTML = '<div class="col-span-full text-center text-white">Loading NFTs...</div>';
    
    try {
        // Fetch real NFTs from contract
        const contractNfts = await fetchNftsFromContract();
        
        // Combine with dummy NFTs for demo purposes
        allNfts = [...dummyNfts, ...contractNfts];
        
        // Apply current filter
        const filteredNfts = getFilteredNfts(allNfts);
        
        if (filteredNfts.length === 0) {
            nftGallery.innerHTML = `
                <div class="col-span-full text-center text-white py-12">
                    <i class="fas fa-images text-4xl mb-4 opacity-50"></i>
                    <p class="text-lg mb-2">No NFTs found</p>
                    <p class="text-gray-400">
                        ${currentFilter === 'owned' ? 'You don\'t own any NFTs yet.' : 
                          currentFilter === 'listed' ? 'No NFTs are currently listed for sale.' : 
                          'No NFTs available in the marketplace.'}
                    </p>
                </div>
            `;
        } else {
            nftGallery.innerHTML = filteredNfts.map(nft => createNftCard(nft)).join('');
        }
        
        console.log(`NFT gallery populated with ${filteredNfts.length} NFTs (filter: ${currentFilter})`);
    } catch (error) {
        console.error('Failed to render NFTs:', error);
        nftGallery.innerHTML = `
            <div class="col-span-full text-center text-red-400 py-12">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p class="text-lg mb-2">Failed to load NFTs</p>
                <p class="text-gray-400">Please try refreshing the page.</p>
            </div>
        `;
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
        renderNfts();
    } catch (error) {
        console.error('Upload/Mint failed:', error);
        alert(`Failed: ${error.message}. Check funds/gas.`);
    } finally {
        uploadMintBtn.innerHTML = 'Create & Mint';
    }
}

// Enhanced marketplace functions
window.listNFT = async (tokenId) => {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Please connect your wallet first.');
        connectWallet();
        return;
    }
    
    const price = prompt('Enter listing price in BNB:');
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        alert('Please enter a valid price.');
        return;
    }
    
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Check if user owns the NFT
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() !== address.toLowerCase()) {
            alert('You do not own this NFT.');
            return;
        }
        
        const priceWei = ethers.parseEther(price);
        const tx = await contract.listNFT(tokenId, priceWei, { gasLimit: 250000 });
        
        // Show transaction pending
        alert(`Listing NFT #${tokenId} for ${price} BNB...\nTransaction: ${tx.hash}`);
        
        await tx.wait();
        alert(`NFT #${tokenId} successfully listed for ${price} BNB!`);
        
        // Refresh the gallery
        renderNfts();
    } catch (error) {
        console.error('Listing failed:', error);
        let errorMessage = error.message;
        if (error.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees';
        }
        alert(`Listing failed: ${errorMessage}`);
    }
};

window.unlistNFT = async (tokenId) => {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Please connect your wallet first.');
        return;
    }
    
    if (!confirm('Are you sure you want to remove this listing?')) {
        return;
    }
    
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // List with price 0 to unlist
        const tx = await contract.listNFT(tokenId, 0, { gasLimit: 200000 });
        
        alert(`Removing listing for NFT #${tokenId}...\nTransaction: ${tx.hash}`);
        
        await tx.wait();
        alert(`NFT #${tokenId} listing removed successfully!`);
        
        renderNfts();
    } catch (error) {
        console.error('Unlisting failed:', error);
        alert(`Unlisting failed: ${error.message}`);
    }
};

window.buyNFT = async (tokenId, priceStr) => {
    const { signer, address } = window.wagyDog.getWalletState();
    if (!signer || !address) {
        alert('Please connect your wallet first.');
        connectWallet();
        return;
    }
    
    // Ensure tokenId refers to an on-chain NFT; prevent dummy purchases
    const nft = allNfts.find(n => n.tokenId === tokenId);
    if (!nft || !nft.fromContract) {
        alert('This item is for display only. Please select a listed on-chain NFT.');
        return;
    }

    if (!confirm(`Are you sure you want to buy this NFT for ${priceStr} BNB?`)) {
        return;
    }
    
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Get the exact listing price from contract
        const listingPrice = await contract.getListingPrice(tokenId);
        if (listingPrice === 0n) {
            alert('This NFT is no longer listed for sale.');
            renderNfts();
            return;
        }
        
        // Check user balance
        const balance = await signer.getBalance();
        const gasEstimate = 300000n * 20000000000n; // Rough gas estimate
        if (balance < listingPrice + gasEstimate) {
            alert('Insufficient BNB balance for this purchase.');
            return;
        }
        
        const tx = await contract.buyNFT(tokenId, { 
            value: listingPrice, 
            gasLimit: 300000 
        });
        
        alert(`Purchasing NFT #${tokenId} for ${ethers.formatEther(listingPrice)} BNB...\nTransaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        alert(`NFT #${tokenId} purchased successfully!\nTransaction: ${receipt.hash}\nView on BSCScan: https://testnet.bscscan.com/tx/${receipt.hash}`);
        
        renderNfts();
    } catch (error) {
        console.error('Purchase failed:', error);
        let errorMessage = error.message;
        if (error.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for this purchase';
        }
        alert(`Purchase failed: ${errorMessage}`);
    }
};

// NFT Detail Modal
window.openNftModal = (nftId) => {
    const nft = allNfts.find(n => n.id === nftId);
    if (!nft) return;
    
    const { address } = window.wagyDog.getWalletState();
    const isOwner = address && nft.owner && nft.owner.toLowerCase() === address.toLowerCase();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="relative">
                <img src="${nft.image}" alt="${nft.name}" class="w-full h-64 md:h-80 object-cover rounded-t-2xl">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-white">${nft.name} #${nft.tokenId}</h2>
                        <p class="text-gray-400">by ${nft.artist}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-gray-400 text-sm">Price</p>
                        <p class="text-xl font-bold text-white">
                            ${nft.isListed ? nft.price + ' BNB' : 'Not Listed'}
                        </p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-white mb-2">Description</h3>
                    <p class="text-gray-300">${nft.description}</p>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-white mb-2">Details</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-400">Token ID:</span>
                            <span class="text-white ml-2">#${nft.tokenId}</span>
                        </div>
                        <div>
                            <span class="text-gray-400">Owner:</span>
                            <span class="text-white ml-2">${isOwner ? 'You' : (nft.owner ? nft.owner.substring(0, 6) + '...' + nft.owner.substring(nft.owner.length - 4) : 'Unknown')}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-gray-400">Status:</span>
                            <span class="text-white ml-2">${nft.isListed ? 'Listed for Sale' : 'Not Listed'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    ${address && !isOwner && nft.isListed ? `<button onclick="buyNFT(${nft.tokenId}, '${nft.price}'); this.closest('.fixed').remove();" class="btn-primary flex-1">Buy for ${nft.price} BNB</button>` : ''}
                    ${address && isOwner && !nft.isListed ? `<button onclick="listNFT(${nft.tokenId}); this.closest('.fixed').remove();" class="btn-secondary flex-1">List for Sale</button>` : ''}
                    ${address && isOwner && nft.isListed ? `<button onclick="unlistNFT(${nft.tokenId}); this.closest('.fixed').remove();" class="btn-secondary flex-1">Remove Listing</button>` : ''}
                    ${!address ? '<button onclick="connectWallet(); this.closest(\'.fixed\').remove();" class="btn-primary flex-1">Connect Wallet</button>' : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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
        const tx = await contract.safeMint(address, defaultUri, { value: mintPrice, gasLimit: 300000 });
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

// Filter functionality
window.setFilter = (filter) => {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Re-render with new filter
    renderNfts();
};

// Initialize marketplace
const initializeMarketplace = () => {
    // Render NFTs on page load
    renderNfts();
    
    // Listen for wallet connection changes
    window.addEventListener('walletConnected', () => {
        renderNfts();
    });
    
    window.addEventListener('walletDisconnected', () => {
        renderNfts();
    });
};

if (mintBtn) {
    mintBtn.addEventListener('click', mintNFT);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMarketplace);
} else {
    initializeMarketplace();
}
