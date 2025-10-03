import { initStarfields } from './utils.js';
import { connectWallet, disconnectWallet } from './wallet.js';
import { renderNfts } from './nft.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("WagyDog DApp loaded and running!");

    // Mobile menu
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            console.log('Mobile menu toggled');
            mobileMenu.classList.toggle('hidden');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Scroll animations
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    if (fadeInSections.length > 0) {
        console.log(`Found ${fadeInSections.length} sections to animate.`);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeInSections.forEach(section => {
            observer.observe(section);
        });
    } else {
        console.log("No sections with '.fade-in-section' found to observe.");
    }

    // Init starfields
    initStarfields();

    // Render NFTs
    renderNfts();

    // Wallet listeners
    const connectButtons = document.querySelectorAll('#header-connect-btn, #mobile-connect-btn, #dashboard-connect-btn');
    connectButtons.forEach((btn, index) => {
        console.log(`Attaching listener to connect button ${index}:`, btn.id);
        btn.addEventListener('click', (e) => {
            console.log('Connect button clicked:', btn.id);
            e.preventDefault();
            e.stopPropagation();
            connectWallet();
        });
    });

    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', (e) => {
            console.log('Disconnect clicked');
            e.preventDefault();
            disconnectWallet();
        });
    }

    // Upload/Mint listener
    const uploadMintBtn = document.getElementById('upload-mint-btn');
    if (uploadMintBtn) {
        uploadMintBtn.addEventListener('click', uploadAndMintNFT);
    }

    console.log('DApp fully initialized');
});

// Global functions for marketplace
window.uploadAndMintNFT = uploadAndMintNFT;
window.listNFT = listNFT;
window.buyNFT = buyNFT;
