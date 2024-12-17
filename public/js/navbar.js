function createNavbar() {
    return `
    <nav class="fixed top-0 left-0 right-0 z-[999] glass-effect border-b border-gray-700/50">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <!-- Left side -->
                <div class="flex items-center gap-4">
                    <button onclick="toggleSidebar()" class="lg:hidden text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <a href="/" class="flex items-center gap-2">
                        <span class="text-xl font-bold gradient-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                            Discord Lookup
                        </span>
                    </a>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden lg:flex items-center gap-4">
                    <a href="/" class="text-gray-400 hover:text-white">Home</a>
                    <a href="/docs" class="text-gray-400 hover:text-white">API Docs</a>
                    <a href="/server" class="text-gray-400 hover:text-white">Server Lookup</a>
                    <a href="/invite" class="text-gray-400 hover:text-white">Invite Lookup</a>
                    <a href="/search" class="text-gray-400 hover:text-white">Username Search</a>
                    <a href="https://discord.gg/6h8VjXYuyX" target="_blank" 
                        class="flex items-center gap-2 px-4 py-2 gradient-bg rounded-lg hover:opacity-90 transition-all text-sm">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
                        </svg>
                        Join Server
                    </a>
                </div>

                <!-- Mobile Menu Button -->
                <button onclick="toggleMobileMenu()" class="lg:hidden text-gray-400 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobileMenu" class="lg:hidden hidden">
            <div class="px-4 py-3 space-y-3 glass-effect border-t border-gray-700/50">
                <a href="/" class="block text-gray-400 hover:text-white">Home</a>
                <a href="/docs" class="block text-gray-400 hover:text-white">API Docs</a>
                <a href="/server" class="block text-gray-400 hover:text-white">Server Lookup</a>
                <a href="/invite" class="block text-gray-400 hover:text-white">Invite Lookup</a>
                <a href="https://discord.gg/6h8VjXYuyX" target="_blank" 
                    class="flex items-center gap-2 text-gray-400 hover:text-white">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
                    </svg>
                    Join Server
                </a>
            </div>
        </div>
    </nav>`;
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('animate-fade');
    } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('animate-fade');
    }
}

// Handle window resize
function handleResize() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (window.innerWidth >= 1024) { // lg breakpoint
        mobileMenu.classList.add('hidden');
    }
}

// Initialize navbar
function initNavbar() {
    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuButton = document.querySelector('button[onclick="toggleMobileMenu()"]');
        
        if (mobileMenu && !mobileMenu.contains(e.target) && menuButton && !menuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
}

// Export functions
window.toggleMobileMenu = toggleMobileMenu;
window.initNavbar = initNavbar;
window.createNavbar = createNavbar;