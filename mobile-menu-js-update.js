/* ===== JAVASCRIPT UPDATE PARA MOBILE MENU CENTRADO ===== */

// Encuentra esta función en tu script.js y reemplázala:

const HeaderModule = {
  init() {
    this.header = document.querySelector('.site-header');
    this.mobileToggle = document.getElementById('mobileMenuToggle');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.mobileOverlay = document.getElementById('mobileMenuOverlay');
    
    if (!this.header) return;
    
    this.bindEvents();
    this.handleScroll();
  },

  bindEvents() {
    // Scroll event
    window.addEventListener('scroll', utils.throttle(() => {
      this.handleScroll();
    }, 16));

    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }

    // Close mobile menu when clicking overlay
    if (this.mobileOverlay) {
      this.mobileOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // ✨ NUEVA FUNCIONALIDAD: Close menu when clicking outside the menu container
    if (this.mobileMenu) {
      this.mobileMenu.addEventListener('click', (e) => {
        // Solo cerrar si el clic es en el fondo del menú, no en los items
        if (e.target === this.mobileMenu) {
          this.closeMobileMenu();
        }
      });
    }

    // Close mobile menu when clicking menu links
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (link.getAttribute('href').startsWith('#')) {
          this.closeMobileMenu();
        }
      });
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
        this.closeMobileMenu();
      }
    });
  },

  handleScroll() {
    const scrolled = window.pageYOffset > CONFIG.SCROLL_THRESHOLD;
    this.header.classList.toggle('scrolled', scrolled);
  },

  toggleMobileMenu() {
    const isOpen = document.body.classList.contains('mobile-menu-open');
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu() {
    document.body.classList.add('mobile-menu-open');
    this.mobileToggle?.classList.add('active');
    this.mobileMenu?.classList.add('active');
    this.mobileOverlay?.classList.add('active');
    
    // Update ARIA attributes
    this.mobileToggle?.setAttribute('aria-expanded', 'true');
    this.mobileMenu?.setAttribute('aria-hidden', 'false');
    this.mobileOverlay?.setAttribute('aria-hidden', 'false');
  },

  closeMobileMenu() {
    document.body.classList.remove('mobile-menu-open');
    this.mobileToggle?.classList.remove('active');
    this.mobileMenu?.classList.remove('active');
    this.mobileOverlay?.classList.remove('active');
    
    // Update ARIA attributes
    this.mobileToggle?.setAttribute('aria-expanded', 'false');
    this.mobileMenu?.setAttribute('aria-hidden', 'true');
    this.mobileOverlay?.setAttribute('aria-hidden', 'true');
  }
};

// La funcionalidad clave agregada es esta parte:
/*
if (this.mobileMenu) {
  this.mobileMenu.addEventListener('click', (e) => {
    if (e.target === this.mobileMenu) {
      this.closeMobileMenu();
    }
  });
}
*/