import { initStarfields } from './utils.js';
import { connectWallet, disconnectWallet, openConnectModal } from './wallet.js';
import { renderNfts } from './nft.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 WagyDog DApp loaded and running! To the moon! 🌙");

    // Mobile menu
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu toggled');
            mobileMenu.classList.toggle('hidden');
            
            // Update menu icon
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
                // Reset menu icon
                const icon = menuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && !menuBtn?.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            const icon = menuBtn?.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }
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
            openConnectModal();
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

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add floating animation to logo
    const logo = document.querySelector('img[alt="WagyDog Logo"]');
    if (logo) {
        logo.classList.add('float-animation');
    }

    // Add pulse animation to important buttons
    const importantButtons = document.querySelectorAll('.btn-primary');
    importantButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.classList.add('pulse-animation');
        });
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('pulse-animation');
        });
    });

    // Add loading states to buttons
    const addLoadingState = (button, text = 'Loading...') => {
        const originalText = button.innerHTML;
        button.innerHTML = `<div class="loading-spinner"></div>${text}`;
        button.disabled = true;
        
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    };

    // Make loading state available globally
    window.addLoadingState = addLoadingState;

    console.log('🎉 WagyDog DApp fully initialized! Ready for moon mission! 🚀');
});

// Global functions for marketplace
window.uploadAndMintNFT = uploadAndMintNFT;
window.listNFT = listNFT;
window.buyNFT = buyNFT;
