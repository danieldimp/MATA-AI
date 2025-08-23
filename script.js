// ====== MATA AI - OPTIMIZED SCRIPT.JS ======

// ===== UTILITY FUNCTIONS =====
const utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
  
    // Safe play function for videos - MEJORADO PARA MOBILE
    safePlayVideo(video) {
        // Asegurar que esté muted para mobile
        video.muted = true;
        
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                // Autoplay blocked, ensure video is muted and try again
                video.muted = true;
                video.closest('.case')?.classList.remove('unmuted');
                
                // Recargar el video para mobile
                video.load();
                
                // Intentar reproducir en la primera interacción del usuario
                const playOnInteraction = () => {
                    video.play().catch(() => {
                        console.log('Video autoplay still blocked');
                    });
                };
                
                // Escuchar múltiples eventos de interacción
                document.addEventListener('touchstart', playOnInteraction, { once: true });
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('scroll', playOnInteraction, { once: true });
            });
        }
    },
  
    // Detectar si es mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }
  };
  
  // ===== CORE FUNCTIONALITY =====
  
  // Reveal on scroll animation
  const initRevealOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
            }
        });
    }, { threshold: 0.08 });
  
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  };
  
  // Footer year update
  const updateFooterYear = () => {
    const yearElement = document.getElementById('y');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
  };
  
  // ===== VIDEO FUNCTIONALITY =====
  
  // ISSUE-002 FIX: Enhanced mobile video autoplay strategy
  const initVideoAutoplay = () => {
    const caseVideos = document.querySelectorAll('.case-video');
    const heroVideo = document.querySelector('.hero-video');
    
    // ISSUE-002: Enhanced hero video mobile handling
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.preload = utils.isMobile() ? 'metadata' : 'auto';
        
        if (utils.isMobile()) {
            // Multi-trigger approach for mobile autoplay
            const triggers = ['touchstart', 'scroll', 'click', 'visibilitychange'];
            let hasPlayed = false;
            
            const attemptPlay = () => {
                if (hasPlayed) return;
                
                heroVideo.play().then(() => {
                    hasPlayed = true;
                    console.log('✅ Hero video playing on mobile');
                }).catch(() => {
                    // Fallback: Show static state with play indicator
                    heroVideo.style.opacity = '0.8';
                    heroVideo.style.filter = 'grayscale(100%)';
                    console.log('📱 Mobile autoplay blocked, showing fallback');
                });
            };
            
            // Register multiple triggers
            triggers.forEach(event => {
                document.addEventListener(event, attemptPlay, { once: true, passive: true });
            });
            
            // Immediate attempt for modern mobile browsers
            setTimeout(attemptPlay, 100);
        } else {
            // Desktop: immediate play
            console.log('🖥️ Desktop: Starting hero video immediately');
            utils.safePlayVideo(heroVideo);
        }
        
        // Enhanced visibility handling
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && heroVideo.paused) {
                utils.safePlayVideo(heroVideo);
            }
        });
        
        // Desktop hover enhancement
        if (!utils.isMobile()) {
            const heroSection = heroVideo.closest('.hero');
            if (heroSection) {
                heroSection.addEventListener('mouseenter', () => {
                    if (heroVideo.paused) {
                        utils.safePlayVideo(heroVideo);
                    }
                });
            }
        }
    }
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
            if (isIntersecting) {
                // Delay más largo para mobile
                const delay = utils.isMobile() ? 500 : 100;
                setTimeout(() => {
                    utils.safePlayVideo(target);
                }, delay);
            } else {
                target.pause();
            }
        });
    }, { threshold: utils.isMobile() ? 0.2 : 0.35 });
  
    caseVideos.forEach(video => {
        // Configurar atributos para mobile
        video.muted = true;
        video.playsInline = true;
        videoObserver.observe(video);
    });
  };
  
  // Video audio controls - MEJORADO PARA MOBILE
  const initVideoAudioControls = () => {
    const caseVideos = document.querySelectorAll('.case-video');
  
    caseVideos.forEach(video => {
        const card = video.closest('.case');
        if (!card) return;
  
        // Desktop hover unmute (solo si no es mobile)
        if (!utils.isMobile()) {
            video.addEventListener('mouseenter', () => {
                if (video.dataset.noaudio === 'true') return;
                
                video.muted = false;
                video.volume = 0.7;
                card.classList.add('unmuted');
                utils.safePlayVideo(video);
            });
  
            video.addEventListener('mouseleave', () => {
                video.muted = true;
                card.classList.remove('unmuted');
                utils.safePlayVideo(video);
            });
        }
  
        // Click/tap toggle for mobile and desktop
        video.addEventListener('click', () => {
            if (video.dataset.noaudio === 'true') {
                video.muted = true;
                utils.safePlayVideo(video);
                return;
            }
  
            const willUnmute = video.muted;
            video.muted = !video.muted;
            card.classList.toggle('unmuted', !video.muted);
            
            if (willUnmute) video.volume = 0.7;
            utils.safePlayVideo(video);
        });
  
        // Audio control button functionality
        const audioControl = card.querySelector('.audio-control');
        if (audioControl) {
            audioControl.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVideoAudio(video, audioControl);
            });
  
            audioControl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleVideoAudio(video, audioControl);
                }
            });
        }
    });
  };
  
  // Toggle audio function
  const toggleVideoAudio = (video, button) => {
    const card = video.closest('.case');
    const willUnmute = video.muted;
    
    video.muted = !video.muted;
    card?.classList.toggle('unmuted', !video.muted);
    button?.classList.toggle('muted', video.muted);
    
    if (willUnmute) video.volume = 0.7;
    utils.safePlayVideo(video);
  
    // Update button icon
    if (button) {
        const icon = button.querySelector('.audio-icon');
        if (icon) {
            if (video.muted) {
                icon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
            } else {
                icon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
            }
        }
    }
  };
  
  // ===== HERO ANIMATIONS ===== 
  
  // Hero headline word glass effect - SIMPLIFICADO (sin efectos de deformación)
  const initHeroGlassEffect = () => {
    // Función simplificada - ya no aplica efectos de distorsión
    console.log('Hero glass effect initialized (simplified)');
  };
  
  // ===== TYPEWRITER EFFECT FOR HERO =====
  
  const initTypewriterEffect = () => {
    const typewriterElement = document.getElementById('typewriter-text');
    const cursor = document.querySelector('.typewriter-cursor');
    
    if (!typewriterElement) return;
    
    const text = "High-end generative films, cinematic product visuals, and AI-powered campaigns.";
    const typingSpeed = 50; // ms per character
    const startDelay = 4900; // Start after paragraph animation begins
    
    let i = 0;
    
    const typeWriter = () => {
      if (i < text.length) {
        typewriterElement.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, typingSpeed);
      } else {
        // Stop cursor blinking after typing is complete
        setTimeout(() => {
          if (cursor) cursor.style.opacity = '0';
        }, 2000);
      }
    };
    
    // Start typing after delay
    setTimeout(typeWriter, startDelay);
  };
  
  // ===== MARQUEE FUNCTIONALITY =====
  
  // Client logos marquee - MEJORADO PARA GARANTIZAR QUE SE VEAN LOS LOGOS
  const initClientMarquee = () => {
    const BASE_PATH = "assets/clients/";
    
    // Logos con nombres de archivo exactos - VERIFICADOS
    const logos = [
        { file: "natura.svg", alt: "Natura" },
        { file: "ado.svg", alt: "ADO Platino" },
        { file: "innovasport.svg", alt: "Innovasport" },
        { file: "adidas.svg", alt: "Adidas" },
        { file: "mercedes.svg", alt: "Mercedes-Benz" },
        { file: "walmart.svg", alt: "Walmart" },
        { file: "nike.svg", alt: "Nike" },
        { file: "snickers.svg", alt: "Snickers" },
        { file: "bbva.svg", alt: "BBVA" }
    ];
    
    const track = document.getElementById("marqueeTrack");
    if (!track) {
        console.warn('Marquee track element not found');
        return;
    }
    
    // Crear HTML para cada logo con error handling
    const logoHTML = logos.map(logo => `
        <div class="logo">
            <img 
                src="${BASE_PATH}${logo.file}" 
                alt="${logo.alt}" 
                onerror="this.style.display='none'; console.warn('Logo not found: ${BASE_PATH}${logo.file}');"
                onload="console.log('Logo loaded: ${logo.alt}');"
            />
        </div>
    `).join("");
    
    // Crear loop continuo duplicando el contenido 3 veces para mejor fluidez
    track.innerHTML = logoHTML + logoHTML + logoHTML;
    
    console.log('Client marquee initialized with', logos.length, 'logos');
    
    // Verificar si los logos se están cargando
    setTimeout(() => {
    const loadedLogos = track.querySelectorAll('img:not([style*="display: none"])');
    console.log(`${loadedLogos.length} of ${logos.length * 3} logos loaded successfully`);
    
    if (loadedLogos.length === 0) {
    console.error('No logos loaded! Check if assets/clients/ folder exists and contains SVG files');
    // Fallback: mostrar nombres de texto si no hay logos
    track.innerHTML = `
    <div class="logo-fallback">
    ${logos.map(logo => `<span class="brand-name">${logo.alt}</span>`).join(' • ')}
    </div>
    `;
    }
    }, 2000);
};

// ===== AUTO-FOCUS CONTACT FORM =====

// Auto-focus en el formulario cuando llegan desde CTAs
const initContactFormFocus = () => {
    // Detectar si llegaron desde un enlace interno
    const urlParams = new URLSearchParams(window.location.search);
    const fromCTA = document.referrer.includes(window.location.hostname) || urlParams.has('from');
    
    // Si hay hash #contact, hacer scroll y focus
    if (window.location.hash === '#contact') {
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.focus();
                nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500); // Delay para que termine el scroll
    }

    // También aplicar focus cuando hacen clic en CTAs internos
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="#contact"]');
        if (link && link.href.includes('#contact')) {
            setTimeout(() => {
                const nameInput = document.getElementById('name');
                if (nameInput) {
                    nameInput.focus();
                }
            }, 800); // Delay para el smooth scroll
        }
    });
};
  
  // ===== SERVICES CAROUSEL =====
  
  // Services data - OPTIMIZED FOR MOBILE & DESKTOP VIEWING
  const servicesData = [
    {
        title: "AI Video & Animation",
        description: "Cinematic video production with AI-enhanced motion graphics and dynamic storytelling.",
        image: "assets/services/ai-video-animation.jpg",
        tags: ["Video Production", "Animation", "Motion Graphics"]
    },
    {
        title: "Product Beauty Shots",
        description: "Premium product photography with perfect lighting, angles and brand consistency.",
        image: "assets/services/ai-product-beauty.jpg",
        tags: ["Product Photography", "Beauty Shots", "Brand Imagery"]
    },
    {
        title: "Character & Avatar Design",
        description: "Custom brand characters and digital personas for consistent storytelling across platforms.",
        image: "assets/services/character-avatars.jpg",
        tags: ["Character Design", "Brand Avatars", "Digital Personas"]
    },
    {
        title: "Editorial & Finishing",
        description: "Professional post-production, color grading and image enhancement for flawless results.",
        image: "assets/services/ai-editorial-finishing.jpg",
        tags: ["Post-Production", "Color Grading", "Enhancement"]
    },
    {
        title: "Generative Audio",
        description: "AI-powered sound design, voice synthesis and adaptive audio for immersive experiences.",
        image: "assets/services/generative-audio.jpg",
        tags: ["Sound Design", "Voice Synthesis", "Audio Production"]
    },
    {
        title: "VFX & Compositing",
        description: "Advanced visual effects and seamless compositing for cinematic brand experiences.",
        image: "assets/services/generative-vfx.jpg",
        tags: ["Visual Effects", "Compositing", "CGI Integration"]
    },
    {
        title: "Custom AI Workflows",
        description: "Tailored automation systems and AI pipelines for scalable creative production.",
        image: "assets/services/custom-ai-workflows.jpg",
        tags: ["Automation", "AI Pipelines", "Scalable"]
    },
    {
        title: "Strategy & Consulting",
        description: "Complete AI adoption roadmaps and creative workflow optimization for brands.",
        image: "assets/services/consulting-rd.jpg",
        tags: ["AI Strategy", "Consulting", "Workflow Optimization"]
    }
  ];
  
  // Generate services carousel - efficient version with only 2x duplication
  const initServicesCarousel = () => {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
  
    // ISSUE-005 FIX: Enhanced accessibility for service cards
    const createServiceCard = (service, index) => `
        <article class="service-card" role="article" aria-labelledby="service-title-${index}">
            <div class="service-card__media">
                <img src="${service.image}" alt="${service.title} service showcase" class="service-card__image">
                <div class="service-card__overlay">
                    <div class="service-card__header">
                        <h3 id="service-title-${index}" class="service-card__title">${service.title}</h3>
                    </div>
                    <div class="service-card__content">
                        <p class="service-card__description">${service.description}</p>
                        <div class="service-card__tags" role="list" aria-label="Service capabilities">
                            ${service.tags.map(tag => `<span class="tag" role="listitem">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `;
  
    // ISSUE-005 FIX: Accessibility-enhanced card generation
    const cardsHTML = servicesData.map((service, index) => createServiceCard(service, index)).join('');
    const cardsHTML2 = servicesData.map((service, index) => createServiceCard(service, index + 8)).join('');
    track.innerHTML = cardsHTML + cardsHTML2; // 8 + 8 = 16 cards with unique IDs
  };
  
  // Services Carousel Class with Persistent Drag + Mouse Wheel + Smooth Slow Drag
  class ServicesCarousel {
    constructor() {
        this.carousel = document.getElementById('servicesCarousel');
        this.track = document.getElementById('carouselTrack');
        
        if (!this.carousel || !this.track) return;
        
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.lastX = 0; // For smooth slow drag
        this.accumulatedOffset = 0; // Track total accumulated drag offset
        this.animationPaused = false;
        this.dragSensitivity = utils.isMobile() ? 1.5 : 1.2; // Mayor sensibilidad en mobile
        
        this.init();
    }
  
    init() {
        this.bindEvents();
        this.startPerspectiveUpdates();
        this.setupDynamicAnimation();
    }
  
    setupDynamicAnimation() {
        // Simple animation without complex resets
        let animationStart = performance.now();
        const baseSpeed = 45000; // 45 seconds for full cycle
        
        const animate = (currentTime) => {
            if (!this.isDragging && !this.animationPaused) {
                const elapsed = currentTime - animationStart;
                const progress = (elapsed / baseSpeed) % 1;
                
                // Simple base animation
                const singleLoopDistance = -380 * 8; // Distance for 8 cards
                const basePosition = progress * singleLoopDistance;
                
                // Just add the offset - no complex logic
                const finalPosition = basePosition + this.accumulatedOffset;
                
                this.track.style.transform = `translate3d(${finalPosition}px, 0, 0)`;
            }
            
            requestAnimationFrame(animate);
        };
        
        // Disable CSS animation and use our custom one
        this.track.classList.remove('carousel-track--auto-scroll');
        requestAnimationFrame(animate);
    }
  
    updateCardPerspectives() {
        if (utils.isMobile()) return; // No perspective en mobile
        
        const cards = this.track.querySelectorAll('.service-card:not(.hover-active)');
        const viewportCenter = window.innerWidth / 2;
        
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distanceFromCenter = (cardCenter - viewportCenter) / viewportCenter;
            
            let rotation = 0;
            const maxRotation = 8;
            const deadzone = 0.2;
            
            if (distanceFromCenter < -deadzone) {
                rotation = Math.min(maxRotation, (-distanceFromCenter - deadzone) * maxRotation * 2);
            } else if (distanceFromCenter > deadzone) {
                rotation = -Math.min(maxRotation, (distanceFromCenter - deadzone) * maxRotation * 2);
            }
            
            card.style.transform = `perspective(1200px) rotateY(${rotation}deg) translateZ(0)`;
        });
    }
  
    startPerspectiveUpdates() {
        const updateLoop = () => {
            if (!this.isDragging) {
                this.updateCardPerspectives();
            }
            requestAnimationFrame(updateLoop);
        };
        updateLoop();
    }
  
    bindEvents() {
        // Mouse events (solo en desktop)
        if (!utils.isMobile()) {
            this.carousel.addEventListener('mousedown', this.startDrag.bind(this));
            this.carousel.addEventListener('mousemove', this.drag.bind(this));
            this.carousel.addEventListener('mouseup', this.endDrag.bind(this));
            this.carousel.addEventListener('mouseleave', this.endDrag.bind(this));
        }
        
        // Touch events (mobile y desktop)
        this.carousel.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        this.carousel.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        this.carousel.addEventListener('touchend', this.endDrag.bind(this));
        
        // Mouse wheel horizontal scroll (solo desktop)
        if (!utils.isMobile()) {
            this.carousel.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        }
        
        // Prevent context menu during drag
        this.carousel.addEventListener('contextmenu', (e) => {
            if (this.isDragging) e.preventDefault();
        });
        
        // Hover states (solo desktop)
        if (!utils.isMobile()) {
            this.track.addEventListener('mouseenter', (e) => {
                if (e.target.closest('.service-card')) {
                    e.target.closest('.service-card').classList.add('hover-active');
                }
            }, true);
            
            this.track.addEventListener('mouseleave', (e) => {
                if (e.target.closest('.service-card')) {
                    e.target.closest('.service-card').classList.remove('hover-active');
                }
            }, true);
        }
    }
  
    handleWheel(e) {
        // Only handle horizontal scroll for carousel
        const deltaX = e.deltaX;
        
        // If there's no horizontal scroll, let vertical scroll work normally
        if (Math.abs(deltaX) < 1) {
            return; // Let the page scroll vertically
        }
        
        // Only prevent default for horizontal scroll
        e.preventDefault();
        
        // Moderate sensitivity to prevent extreme jumps
        const wheelOffset = deltaX * 2; // Reduced sensitivity
        this.accumulatedOffset -= wheelOffset;
        
        // NO RESET - let it accumulate infinitely
        // The duplicate cards will handle the visual continuity
    }
  
    getEventX(e) {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }
  
    startDrag(e) {
        this.isDragging = true;
        this.startX = this.getEventX(e);
        this.lastX = this.startX;
        this.currentX = 0;
        this.carousel.style.cursor = 'grabbing';
        
        // Pause the automatic animation
        this.animationPaused = true;
        
        e.preventDefault();
    }
  
    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const x = this.getEventX(e);
        const deltaX = (x - this.startX) * this.dragSensitivity;
        const incrementalDelta = (x - this.lastX) * this.dragSensitivity;
        
        this.currentX = deltaX;
        this.lastX = x;
        
        // Get current computed transform
        const currentTransform = getComputedStyle(this.track).transform;
        let currentTranslateX = 0;
        
        if (currentTransform && currentTransform !== 'none') {
            const matrix = currentTransform.match(/matrix.*\((.+)\)/);
            if (matrix) {
                const values = matrix[1].split(', ');
                currentTranslateX = parseFloat(values[4]) || 0;
            }
        }
        
        // Apply incremental drag for smoother slow movements
        const newPosition = currentTranslateX + incrementalDelta;
        this.track.style.transform = `translate3d(${newPosition}px, 0, 0)`;
        
        // Update accumulated offset in real-time for better tracking
        this.accumulatedOffset += incrementalDelta;
    }
  
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.carousel.style.cursor = 'grab';
        
        // ISSUE-004 FIX: Bounded infinite scroll prevents memory growth
        const maxOffset = 3800; // ~10 card widths for safety margin
        if (Math.abs(this.accumulatedOffset) > maxOffset) {
            // Reset accumulated offset to prevent memory issues
            const cardLoopDistance = 380 * 8; // Distance for one complete loop
            this.accumulatedOffset = this.accumulatedOffset % cardLoopDistance;
            console.log('🔄 Carousel offset reset for performance');
        }
        
        // Resume automatic animation from current position
        this.animationPaused = false;
        this.currentX = 0;
        this.lastX = 0;
    }
  }
  
  // ===== MOBILE MENU FUNCTIONALITY =====
  
  class MobileMenu {
    constructor() {
        this.toggle = document.getElementById('mobileMenuToggle');
        this.overlay = document.getElementById('mobileMenuOverlay');
        this.menu = document.getElementById('mobileMenu');
        this.menuLinks = this.menu ? this.menu.querySelectorAll('a') : [];
        this.isOpen = false;
        
        if (this.toggle && this.overlay && this.menu) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Toggle button
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });
    
        // Overlay click to close
        this.overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeMenu();
        });
    
        // MEJORADO: Click fuera del menú cierra (con mejor detección)
        document.addEventListener('click', (e) => {
            // Solo verificar si el menú está abierto
            if (!this.isOpen) return;
            
            // Si el clic fue en el botón toggle, no hacer nada (ya se maneja arriba)
            if (this.toggle && this.toggle.contains(e.target)) {
                return;
            }
            
            // Si el clic fue dentro del menú, no cerrarlo
            if (this.menu && this.menu.contains(e.target)) {
                return;
            }
            
            // En cualquier otro caso, cerrar el menú
            this.closeMenu();
        });
        
        // NUEVO: Touch events para móviles (fuera del área del menú)
        document.addEventListener('touchstart', (e) => {
            // Solo verificar si el menú está abierto
            if (!this.isOpen) return;
            
            // Si el touch fue en el botón toggle o dentro del menú, no hacer nada
            if ((this.toggle && this.toggle.contains(e.target)) || 
                (this.menu && this.menu.contains(e.target))) {
                return;
            }
            
            // En cualquier otro caso, cerrar el menú
            this.closeMenu();
        }, { passive: true });
    
        // Menu links click to close
        this.menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Pequeño delay para permitir que la navegación suceda
                setTimeout(() => {
                    this.closeMenu();
                }, 100);
            });
        });
    
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.closeMenu();
            }
        });
    
        // Prevent scroll when menu is open
        this.menu.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // NUEVO: Cerrar menú al cambiar orientación
        window.addEventListener('orientationchange', () => {
            if (this.isOpen) {
                this.closeMenu();
            }
        });
        
        // NUEVO: Cerrar menú al redimensionar ventana
        window.addEventListener('resize', utils.debounce(() => {
            if (this.isOpen && window.innerWidth > 768) {
                this.closeMenu();
            }
        }, 250));
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        this.toggle.classList.add('active');
        this.overlay.classList.add('active');
        this.menu.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add focus trap (accesibilidad)
        this.addFocusTrap();
        
        console.log('📱 Mobile menu opened');
    }

    closeMenu() {
        this.isOpen = false;
        this.toggle.classList.remove('active');
        this.overlay.classList.remove('active');
        this.menu.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove focus trap
        this.removeFocusTrap();
        
        console.log('📱 Mobile menu closed');
    }
    
    // NUEVO: Focus trap para accesibilidad
    addFocusTrap() {
        const focusableElements = this.menu.querySelectorAll(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            this.firstFocusableElement = focusableElements[0];
            this.lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            // Focus en el primer elemento
            this.firstFocusableElement.focus();
            
            // Trap focus dentro del menú
            this.menu.addEventListener('keydown', this.trapFocus.bind(this));
        }
    }
    
    removeFocusTrap() {
        this.menu.removeEventListener('keydown', this.trapFocus.bind(this));
        
        // Return focus to toggle button
        if (this.toggle) {
            this.toggle.focus();
        }
    }
    
    trapFocus(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === this.firstFocusableElement) {
                    e.preventDefault();
                    this.lastFocusableElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === this.lastFocusableElement) {
                    e.preventDefault();
                    this.firstFocusableElement.focus();
                }
            }
        }
    }
  }
  
  // ===== VIDEO MODAL FUNCTIONALITY =====
  
    // Project data for modal
    const projectData = {
    'snickers': {
        title: 'Gen AI Product Campaign',
        description: 'AI-generated product visuals with dynamic motion graphics and hero shots.',
        video: 'assets/videos/snickers.mp4',
        hasAudio: true
    },
    'sports-retail': {
        title: 'Gen AI Sports Campaign',
        description: 'AI-powered sports visuals with dynamic motion and precise sound design.',
        video: 'assets/videos/innovasport.mp4',
        hasAudio: true
    },
    'confectionery': {
        title: 'Gen AI Product Campaign',
        description: 'AI-generated product visuals with dynamic motion graphics and hero shots.',
        video: 'assets/videos/snickers.mp4',
        hasAudio: true
    },
    'transportation-beauty': {
        title: 'Gen AI Vehicle Beauty Shots',
        description: 'AI-powered luxury vehicle visuals with beauty lighting and refined details.',
        video: 'assets/videos/ado-beauty.mp4',
        hasAudio: true
    },
    'transportation-hero': {
        title: 'Gen AI Vehicle Campaign',
        description: 'AI-generated cinematic vehicle campaign with premium lighting and interior details.',
        video: 'assets/videos/ado-hero.mp4',
        hasAudio: true
    },
    'beauty-product': {
        title: 'Gen AI Beauty Campaign',
        description: 'AI-powered beauty product showcase with macro angles and controlled lighting.',
        video: 'assets/videos/natura.mp4',
        hasAudio: false
    }
};
  
  // Video Modal Class
  class VideoModal {
    constructor() {
        this.modal = document.getElementById('videoModal');
        this.modalVideo = document.getElementById('modalVideo');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalDescription = document.getElementById('modalDescription');
        this.closeBtn = document.getElementById('closeModal');
        this.audioToggle = document.getElementById('modalAudioToggle');
        this.isOpen = false;
        
        if (!this.modal || !this.modalVideo) return;
        
        this.init();
    }
  
    init() {
        this.bindEvents();
        this.initVideoCards();
    }
  
    bindEvents() {
        // Close modal events
        this.closeBtn?.addEventListener('click', () => this.close());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
        
        // Audio toggle
        this.audioToggle?.addEventListener('click', () => {
            this.modalVideo.muted = !this.modalVideo.muted;
            this.audioToggle.classList.toggle('muted', this.modalVideo.muted);
        });
        
        // Video click to play/pause
        this.modalVideo.addEventListener('click', () => {
            if (this.modalVideo.paused) {
                this.modalVideo.play();
            } else {
                this.modalVideo.pause();
            }
        });
    }
  
    initVideoCards() {
        const videoCards = document.querySelectorAll('.case[data-video]');
        
        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoType = card.dataset.video;
                this.open(videoType);
            });
        });
    }
  
    open(videoType) {
        const project = projectData[videoType];
        if (!project) return;
        
        this.modalVideo.src = project.video;
        this.modalTitle.textContent = project.title;
        this.modalDescription.textContent = project.description;
        
        // Show/hide audio toggle based on project
        if (this.audioToggle) {
            this.audioToggle.style.display = project.hasAudio ? 'flex' : 'none';
        }
        
        // Configurar para mobile
        this.modalVideo.muted = true;
        this.modalVideo.playsInline = true;
        this.modalVideo.removeAttribute('controls');
        this.modalVideo.controls = false;
        
        this.modal.classList.add('active');
        this.isOpen = true;
        
        // Play video after modal animation
        setTimeout(() => {
            utils.safePlayVideo(this.modalVideo);
        }, 400);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
  
    close() {
        this.modal.classList.remove('active');
        this.isOpen = false;
        
        // Stop video
        this.modalVideo.pause();
        this.modalVideo.currentTime = 0;
        this.modalVideo.src = '';
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
  }
  
  // ===== SMOOTH SCROLLING =====
  
  // Smooth anchor navigation
  const initSmoothScrolling = () => {
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        
        const targetId = anchor.getAttribute('href').slice(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        // CSS scroll-behavior handles the smooth scrolling
        // This is just for compatibility and potential custom behavior
    }, { passive: true });
  };
  
  // ===== MOBILE OPTIMIZATIONS =====
  
  // Optimizaciones específicas para mobile
  const initMobileOptimizations = () => {
    if (utils.isMobile()) {
        // Reducir animaciones en mobile
        document.documentElement.style.setProperty('--carousel-speed', '60s');
        
        // Agregar clase mobile al body
        document.body.classList.add('mobile');
        
        // Mejorar el scroll en iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Prevenir zoom en inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
                }
            });
            
            input.addEventListener('blur', () => {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1');
                }
            });
        });
    }
  };

  // ===== LOGO FALLBACK STYLES =====
  
  // Añadir estilos dinámicos para fallback de logos si no cargan
  const addLogoFallbackStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .logo-fallback {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            animation: marquee 28s linear infinite;
            padding: 0 24px;
        }
        
        .brand-name {
            font-size: 16px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            white-space: nowrap;
            margin: 0 20px;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .brand-name:hover {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .brand-name {
                font-size: 14px;
                margin: 0 15px;
            }
        }
    `;
    document.head.appendChild(style);
  };
  
  // ===== GLASSMORPHISM HEADER SCROLL EFFECT =====
  const initGlassmorphismHeader = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    let isScrolled = false;
    
    const updateHeaderEffect = utils.debounce(() => {
      const scrollY = window.scrollY;
      const shouldBeScrolled = scrollY > 50;
      
      if (shouldBeScrolled !== isScrolled) {
        isScrolled = shouldBeScrolled;
        
        if (isScrolled) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    }, 10);
    
    // Add scroll listener
    window.addEventListener('scroll', updateHeaderEffect, { passive: true });
    
    // Check initial state
    updateHeaderEffect();
    
    console.log('✨ Glassmorphism header scroll effect initialized');
  };
  
  // ===== PREVENT UNWANTED SCROLL ON PAGE LOAD =====
  const preventInitialScroll = () => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Disable scroll restoration to prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Handle any hash in URL that might cause scroll
    if (window.location.hash && window.location.hash !== '#') {
      // Clear the hash without causing navigation
      history.replaceState('', document.title, window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
    }
    
    // Double-check scroll position after DOM load
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
    
    console.log('✅ Initial scroll prevention initialized');
  };
  
  // ===== INITIALIZATION =====
  
  // Initialize all functionality when DOM is ready
  const initializeApp = () => {
    console.log('🚀 MATA AI - Initializing with CONCISE MOBILE-OPTIMIZED SERVICES');
    console.log('✅ CONTENT: 50% less text + 3 tags max = perfect mobile fit');
    console.log('📱 VISUAL: All tags visible, clear descriptions, optimal spacing');
    console.log('✅ ISSUE-002: Mobile video autoplay - ENHANCED');
    console.log('✅ ISSUE-003: Header consistency - FIXED');
    console.log('✅ ISSUE-004: Carousel performance - OPTIMIZED');
    console.log('✅ ISSUE-005: Accessibility - IMPROVED');
    
    // FIRST: Prevent unwanted scroll
    preventInitialScroll();
    
    // Add fallback styles first
    addLogoFallbackStyles();
    
    // Core functionality
    initRevealOnScroll();
    updateFooterYear();
    
    // Hero effects
    initHeroGlassEffect();
    initTypewriterEffect();
    
    // Video functionality - MEJORADO PARA MOBILE
    initVideoAutoplay();
    initVideoAudioControls();
    
    // Content generation - LOGOS MEJORADOS
    console.log('🎨 Initializing client marquee...');
    initClientMarquee();
    
    console.log('🎠 Initializing services carousel...');
    initServicesCarousel();
    
    // Contact form auto-focus
    initContactFormFocus();
    
    // Interactive components
    new ServicesCarousel();
    new VideoModal();
    new MobileMenu();
    
    // Navigation
    initSmoothScrolling();
    
    // Header glassmorphism effect
    initGlassmorphismHeader();
    
    // Mobile optimizations
    initMobileOptimizations();
    
    // Log para debug
    console.log('✅ MATA AI initialized successfully', {
        isMobile: utils.isMobile(),
        userAgent: navigator.userAgent,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        timestamp: new Date().toISOString()
    });
    
    // Verificar que los elementos críticos estén presentes
    const criticalElements = [
        'marqueeTrack',
        'carouselTrack', 
        'mobileMenuToggle',
        'videoModal'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Critical element missing: ${id}`);
        } else {
            console.log(`✓ Element found: ${id}`);
        }
    });
  };
  
  // ===== IMMEDIATE SCROLL PREVENTION =====
  // Execute immediately to prevent any unwanted scroll
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  
  // ===== ADDITIONAL MOBILE VIDEO FIXES =====
  
  // Intentar reproducir videos después de cualquier interacción del usuario
  document.addEventListener('touchstart', function enableVideoAutoplay() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (video.paused) {
            utils.safePlayVideo(video);
        }
    });
    
    // Solo ejecutar una vez
    document.removeEventListener('touchstart', enableVideoAutoplay);
  }, { once: true });
  
  // Handle page visibility change para pausar/reproducir videos
  document.addEventListener('visibilitychange', () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (document.hidden) {
            video.pause();
        } else {
            utils.safePlayVideo(video);
        }
    });
  });

  // ===== DEBUG HELPERS =====
  
  // Helper function para verificar assets
  window.checkAssets = () => {
    console.log('🔍 Checking assets...');
    
    // Check client logos
    const logos = [
        "natura.svg", "ado.svg", "innovasport.svg", "adidas.svg", 
        "mercedes.svg", "walmart.svg", "nike.svg", "snickers.svg", 
        "bbva.svg"
    ];
    
    logos.forEach(logo => {
        const img = new Image();
        img.onload = () => console.log(`✓ Logo loaded: ${logo}`);
        img.onerror = () => console.error(`❌ Logo failed: ${logo}`);
        img.src = `assets/clients/${logo}`;
    });
    
    // Check service images
    const serviceImages = [
        "ai-video.jpg", "generative-audio.jpg", "product-beauty.jpg",
        "characters-worlds.jpg", "3d-vfx.jpg", "editorial-finishing.jpg",
        "consulting-rd.jpg", "automation.jpg"
    ];
    
    serviceImages.forEach(img => {
        const image = new Image();
        image.onload = () => console.log(`✓ Service image loaded: ${img}`);
        image.onerror = () => console.error(`❌ Service image failed: ${img}`);
        image.src = `assets/services/${img}`;
    });
    
    // Check videos
    const videos = [
        "hero.mp4", "ado-beauty.mp4", "ado-hero.mp4", 
        "snickers.mp4", "innovasport.mp4", "natura.mp4"
    ];
    
    videos.forEach(vid => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => console.log(`✓ Video loaded: ${vid}`);
        video.onerror = () => console.error(`❌ Video failed: ${vid}`);
        video.src = `assets/videos/${vid}`;
    });
  };
  
  // Make debug function available in console
  setTimeout(() => {
    console.log('🛠️ Debug helper available: Run checkAssets() in console to verify all assets');
  }, 1000);