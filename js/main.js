// Premium Rose Milk Landing Page JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Initial Configurations & Constants
    // -------------------------------------------------------------------------
    const FRAME_COUNT = 80;
    const IMAGE_DIR = 'zip file';
    const IMAGE_PREFIX = 'Liquid_swirl_forms_bottle_appears_202605252242_';
    const IMAGE_EXT = '.jpg';

    // Store preloaded Image objects
    const images = [];
    let loadedCount = 0;

    // DOM Elements
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
    const statusPercentage = document.getElementById('status-percentage');

    const scrollTrack = document.getElementById('scroll-track');
    const videoCanvas = document.getElementById('video-canvas');
    const ctx = videoCanvas ? videoCanvas.getContext('2d') : null;

    let currentFrameIndex = 0;

    // -------------------------------------------------------------------------
    // 2. Preloading Image Frames (000 to 079)
    // -------------------------------------------------------------------------
    const pad = (num, size) => {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    };

    const getFrameUrl = (index) => {
        return `${IMAGE_DIR}/${IMAGE_PREFIX}${pad(index, 3)}${IMAGE_EXT}`;
    };

    const startPreloading = () => {
        const loadingMessages = [
            "Chilling the bottles...",
            "Preparing fresh milk...",
            "Adding sweet rose essence...",
            "Styling the premium look...",
            "Getting ready to serve..."
        ];

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            img.src = getFrameUrl(i);
            img.onload = () => {
                loadedCount++;
                const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);

                // Update Progress UI
                if (progressBar) progressBar.style.width = `${percent}%`;
                if (statusPercentage) statusPercentage.innerText = `${percent}%`;

                // Rotate status text occasionally
                if (statusText && i % 15 === 0) {
                    const msgIndex = Math.floor((i / FRAME_COUNT) * loadingMessages.length);
                    statusText.innerText = loadingMessages[Math.min(msgIndex, loadingMessages.length - 1)];
                }

                // Check if all images are loaded
                if (loadedCount === FRAME_COUNT) {
                    onPreloadComplete();
                }
            };

            img.onerror = () => {
                console.error(`Failed to load image frame: ${img.src}`);
                loadedCount++;
                if (loadedCount === FRAME_COUNT) {
                    onPreloadComplete();
                }
            };

            images.push(img);
        }
    };

    const onPreloadComplete = () => {
        // Hide preloader
        if (preloader) {
            preloader.classList.add('fade-out');
        }

        // Initialize Lucide Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Initialize Canvas dimensions
        if (videoCanvas) {
            resizeCanvas(videoCanvas);
            window.addEventListener('resize', () => resizeCanvas(videoCanvas));
        }

        // Initialize Core Functions
        initScrollStorytelling();
        initRosePetals();
        initNavigationEffects();
        initThemeToggle();
    };

    // Helper to draw a specific frame on a canvas (Cover mode to fill full screen)
    const drawFrame = (canvas, context, index) => {
        if (!images[index] || !context) return;

        const img = images[index];
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Cover logic: scale image to cover the canvas completely (crop edges if necessary)
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            // Canvas is taller than image
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        }

        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const resizeCanvas = (canvas) => {
        canvas.width = window.innerWidth * window.devicePixelRatio || window.innerWidth;
        canvas.height = window.innerHeight * window.devicePixelRatio || window.innerHeight;

        if (ctx) {
            drawFrame(canvas, ctx, currentFrameIndex);
        }
    };

    // -------------------------------------------------------------------------
    // 3. Scroll-Driven Video Storytelling
    // -------------------------------------------------------------------------
    const initScrollStorytelling = () => {
        if (!scrollTrack || !videoCanvas || !ctx) return;

        const heroText = document.getElementById('scroll-hero-text');

        // Draw the first frame on load (index 0)
        drawFrame(videoCanvas, ctx, 0);
        if (heroText) {
            heroText.style.opacity = 1;
        }

        const handleScroll = () => {
            const rect = scrollTrack.getBoundingClientRect();
            const trackHeight = scrollTrack.clientHeight;
            const windowHeight = window.innerHeight;

            const scrolled = -rect.top;
            const scrollRange = trackHeight - windowHeight;

            if (scrolled >= 0 && scrolled <= scrollRange) {
                const progress = scrolled / scrollRange;

                // 1. Fade away hero text overlay when scrolling through 30% of the storyteller section
                if (heroText) {
                    if (progress <= 0.3) {
                        const opacity = 1 - (progress / 0.3);
                        heroText.style.opacity = opacity;
                        heroText.style.transform = `translateY(${-progress * 60}px)`; // Elegant float-up
                        heroText.style.display = 'flex';
                    } else {
                        heroText.style.opacity = 0;
                        heroText.style.display = 'none';
                    }
                }

                // 2. Map progress to frame index (0 to 79)
                let frameIndex = Math.floor(progress * (FRAME_COUNT - 1));
                frameIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));

                currentFrameIndex = frameIndex;
                drawFrame(videoCanvas, ctx, frameIndex);
            } else if (scrolled < 0) {
                currentFrameIndex = 0;
                drawFrame(videoCanvas, ctx, 0);
                if (heroText) {
                    heroText.style.opacity = 1;
                    heroText.style.transform = 'translateY(0)';
                    heroText.style.display = 'flex';
                }
            } else if (scrolled > scrollRange) {
                currentFrameIndex = FRAME_COUNT - 1;
                drawFrame(videoCanvas, ctx, FRAME_COUNT - 1);
                if (heroText) {
                    heroText.style.opacity = 0;
                    heroText.style.display = 'none';
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Run once initially
        handleScroll();
    };

    // -------------------------------------------------------------------------
    // 4. Floating Rose Petals
    // -------------------------------------------------------------------------
    const initRosePetals = () => {
        const container = document.getElementById('petals-canvas-container');
        if (!container) return;

        const PETAL_COUNT = 15;

        for (let i = 0; i < PETAL_COUNT; i++) {
            createPetal(container);
        }
    };

    const createPetal = (container) => {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        const size = Math.random() * 12 + 8; // 8px to 20px
        const left = Math.random() * 100; // 0% to 100%
        const delay = Math.random() * 10;
        const duration = Math.random() * 8 + 6;

        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${left}%`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.animationDuration = `${duration}s`;

        const rotate = Math.random() * 360;
        petal.style.transform = `rotate(${rotate}deg)`;

        container.appendChild(petal);

        // Reset position on loop
        petal.addEventListener('animationiteration', () => {
            petal.style.left = `${Math.random() * 100}%`;
            petal.style.animationDuration = `${Math.random() * 8 + 6}s`;
        });
    };

    // -------------------------------------------------------------------------
    // 5. Responsive Transparent Navigation Bar Scrolling
    // -------------------------------------------------------------------------
    const initNavigationEffects = () => {
        const header = document.querySelector('.main-header');
        const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
        const logoLinks = document.querySelectorAll('.logo');
        const toggleBtn = document.querySelector('.mobile-nav-toggle');
        const drawer = document.querySelector('.mobile-drawer');
        const closeBtn = document.querySelector('.mobile-drawer-close');

        // Sections to track for active highlighting
        const sections = [
            { id: 'features', target: 'features' },
            { id: 'details', target: 'details' },
            { id: 'nutrition', target: 'nutrition' }
        ];

        // A. Header scroll styling (transparent to solid glassmorphism)
        const checkScrollHeader = () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        // B. Active Section Highlighting
        const highlightActiveLinks = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;

            // If near top (inside storyteller) or inside hero section, mark 'Products' as active
            const heroEl = document.getElementById('hero');
            const heroTop = heroEl ? heroEl.offsetTop - 120 : viewportHeight * 0.8;
            const heroHeight = heroEl ? heroEl.offsetHeight : viewportHeight;

            if (scrollY < heroTop + heroHeight) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-target') === 'hero');
                });
                return;
            }

            let activeTarget = '';
            sections.forEach(sec => {
                const el = document.getElementById(sec.id);
                if (el) {
                    const top = el.offsetTop - 120;
                    const height = el.offsetHeight;
                    if (scrollY >= top && scrollY < top + height) {
                        activeTarget = sec.target;
                    }
                }
            });

            // Adjust active class on headers
            if (activeTarget) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-target') === activeTarget);
                });
            }
        };

        // C. Smooth Scrolling Math with Offset (e.g. 75px for navigation height)
        const scrollToTarget = (targetId) => {
            if (targetId === 'home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const offset = 75; // Matches the scrolled height of the navigation bar
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        };

        // Click Listeners
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                if (drawer && drawer.classList.contains('open')) {
                    drawer.classList.remove('open');
                }
                scrollToTarget(target);
            });
        });

        logoLinks.forEach(logo => {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToTarget('home');
            });
        });

        // Mobile Drawer Toggling
        if (toggleBtn && drawer && closeBtn) {
            toggleBtn.addEventListener('click', () => drawer.classList.add('open'));
            closeBtn.addEventListener('click', () => drawer.classList.remove('open'));

            // Close drawer if clicking outside
            document.addEventListener('click', (e) => {
                if (drawer.classList.contains('open') &&
                    !drawer.contains(e.target) &&
                    !toggleBtn.contains(e.target)) {
                    drawer.classList.remove('open');
                }
            });
        }

        window.addEventListener('scroll', () => {
            checkScrollHeader();
            highlightActiveLinks();
        });

        // Run once initially
        checkScrollHeader();
        highlightActiveLinks();
    };

    // -------------------------------------------------------------------------
    // 6. Light / Dark Theme Toggle
    // -------------------------------------------------------------------------
    const initThemeToggle = () => {
        const themeToggles = document.querySelectorAll('.theme-toggle-btn');
        const htmlElement = document.documentElement;

        // Function to update the icons based on active mode
        const updateThemeUI = (isDark) => {
            themeToggles.forEach(btn => {
                btn.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>`;
            });
            if (window.lucide) {
                window.lucide.createIcons();
            }
        };

        // Determine initial theme state
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        // Apply initial state
        if (isDark) {
            htmlElement.classList.add('dark');
            htmlElement.classList.remove('light');
        } else {
            htmlElement.classList.add('light');
            htmlElement.classList.remove('dark');
        }
        updateThemeUI(isDark);

        // Click handler for toggles
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering navigation scrolls or drawer closes
                isDark = !htmlElement.classList.contains('dark');
                
                if (isDark) {
                    htmlElement.classList.add('dark');
                    htmlElement.classList.remove('light');
                    localStorage.setItem('theme', 'dark');
                } else {
                    htmlElement.classList.add('light');
                    htmlElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
                
                updateThemeUI(isDark);
            });
        });
    };

    // Start preloading frames
    startPreloading();
});
