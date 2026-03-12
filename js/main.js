/**
 * michaelgurule.com - Main JavaScript
 * Features: Scroll Animations, Navigation, Interactions
 */

// ========================================
// WIRE MESH BACKGROUND
// ========================================
class WireMesh {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationId = null;
        this.isVisible = !document.hidden;
        this.t = 0;

        // Each ribbon is a set of parallel lines sharing the same wave shape
        this.config = {
            ribbons: [
                {
                    lineCount: 18,
                    spread: 90,
                    cp: [
                        { x: 0.0, yBase: 0.55, yAmp: 0.18, phase: 0.0, freq: 0.55 },
                        { x: 0.25, yBase: 0.30, yAmp: 0.22, phase: 1.1, freq: 0.50 },
                        { x: 0.50, yBase: 0.62, yAmp: 0.20, phase: 2.3, freq: 0.45 },
                        { x: 0.75, yBase: 0.25, yAmp: 0.24, phase: 0.7, freq: 0.60 },
                        { x: 1.0, yBase: 0.58, yAmp: 0.18, phase: 1.8, freq: 0.50 },
                    ],
                    colorA: [155, 168, 171],
                    colorB: [37, 55, 69],
                    baseAlpha: 0.18,
                    speed: 0.28,
                },
                {
                    lineCount: 14,
                    spread: 70,
                    cp: [
                        { x: 0.0, yBase: 0.72, yAmp: 0.20, phase: 2.5, freq: 0.40 },
                        { x: 0.30, yBase: 0.42, yAmp: 0.26, phase: 0.4, freq: 0.55 },
                        { x: 0.55, yBase: 0.78, yAmp: 0.18, phase: 3.1, freq: 0.50 },
                        { x: 0.80, yBase: 0.38, yAmp: 0.22, phase: 1.5, freq: 0.45 },
                        { x: 1.0, yBase: 0.65, yAmp: 0.20, phase: 2.0, freq: 0.60 },
                    ],
                    colorA: [74, 92, 106],
                    colorB: [17, 33, 45],
                    baseAlpha: 0.13,
                    speed: 0.20,
                },
                {
                    lineCount: 12,
                    spread: 60,
                    cp: [
                        { x: 0.0, yBase: 0.35, yAmp: 0.16, phase: 1.0, freq: 0.60 },
                        { x: 0.20, yBase: 0.65, yAmp: 0.20, phase: 2.8, freq: 0.48 },
                        { x: 0.50, yBase: 0.40, yAmp: 0.22, phase: 0.2, freq: 0.52 },
                        { x: 0.80, yBase: 0.70, yAmp: 0.18, phase: 1.6, freq: 0.44 },
                        { x: 1.0, yBase: 0.45, yAmp: 0.16, phase: 3.4, freq: 0.56 },
                    ],
                    colorA: [204, 208, 207],
                    colorB: [37, 55, 69],
                    baseAlpha: 0.09,
                    speed: 0.35,
                },
            ],
        };

        this.init();
    }

    init() {
        this.resize();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) this.animate();
        });
    }

    catmullRomY(cp, u, W, H, time, speed) {
        const pts = cp.map(c => ({
            x: c.x * W,
            y: c.yBase * H + Math.sin(time * speed * c.freq + c.phase) * c.yAmp * H,
        }));

        const n = pts.length - 1;
        const seg = Math.min(Math.floor(u * n), n - 1);
        const t = u * n - seg;

        const p0 = pts[Math.max(seg - 1, 0)];
        const p1 = pts[seg];
        const p2 = pts[Math.min(seg + 1, n)];
        const p3 = pts[Math.min(seg + 2, n)];

        const t2 = t * t;
        const t3 = t2 * t;
        const y = 0.5 * (
            (2 * p1.y) +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );
        return y;
    }

    draw() {
        const { ctx, canvas, t } = this;
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        const SEGMENTS = 120;

        this.config.ribbons.forEach(ribbon => {
            const { lineCount, spread, cp, colorA, colorB, baseAlpha, speed } = ribbon;

            for (let li = 0; li < lineCount; li++) {
                const offsetFrac = (li / (lineCount - 1)) - 0.5;
                const yOffset = offsetFrac * spread;

                const edgeFade = 1 - Math.abs(offsetFrac) * 1.6;
                const alpha = Math.max(0, baseAlpha * edgeFade);

                const blend = Math.abs(offsetFrac) * 2;
                const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * blend);
                const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * blend);
                const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * blend);

                ctx.beginPath();
                for (let si = 0; si <= SEGMENTS; si++) {
                    const u = si / SEGMENTS;
                    const x = u * W;
                    const y = this.catmullRomY(cp, u, W, H, t, speed) + yOffset;

                    if (si === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.lineWidth = 0.75;
                ctx.stroke();
            }
        });
    }

    animate() {
        if (!this.isVisible) return;
        this.t += 0.012;
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.fade-in');
        this.init();
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.elements.forEach(element => {
            this.observer.observe(element);
        });
    }
}

// ========================================
// NAVIGATION
// ========================================
class Navigation {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMobile = document.querySelector('.nav-mobile');
        this.navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
        this.sections = document.querySelectorAll('section[id]');

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveLink();
    }

    bindEvents() {
        // Scroll handling for nav background
        window.addEventListener('scroll', () => {
            this.handleScroll();
            this.updateActiveLink();
        });

        // Mobile menu toggle
        if (this.navToggle && this.navMobile) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking a link
            this.navMobile.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
        }

        // Smooth scroll for nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offset = this.nav.offsetHeight;
                        const targetPosition = target.offsetTop - offset;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
    }

    updateActiveLink() {
        const scrollPosition = window.scrollY + this.nav.offsetHeight + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    toggleMobileMenu() {
        this.navToggle.classList.toggle('active');
        this.navMobile.classList.toggle('active');
        this.navToggle.setAttribute(
            'aria-expanded',
            this.navMobile.classList.contains('active')
        );
        document.body.style.overflow = this.navMobile.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.navToggle.classList.remove('active');
        this.navMobile.classList.remove('active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// ========================================
// COUNTER ANIMATION
// ========================================
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat-value[data-target]');
        this.animated = new Set();
        this.init();
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animateCounter(entry.target);
                    this.animated.add(entry.target);
                }
            });
        }, observerOptions);

        this.counters.forEach(counter => {
            this.observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(target * easeOutQuart);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

// ========================================
// CONTACT FORM
// ========================================
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
    }

    handleSubmit(e) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
          <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
        </circle>
      </svg>
      Sending...
    `;
        submitBtn.disabled = true;

        // The form will submit normally to Formspree
        // This just shows a loading state
    }
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Intro splash
    const splash = document.getElementById('intro-splash');
    const heroContent = document.querySelector('.hero-content');
    if (splash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTimeout(() => {
            splash.classList.add('fade-out');
            splash.addEventListener('transitionend', () => {
                splash.remove();
                if (heroContent) heroContent.classList.add('hero-visible');
            }, { once: true });
        }, 1800);
    } else {
        if (splash) splash.remove();
        if (heroContent) heroContent.classList.add('hero-visible');
    }

    // Initialize wire mesh background
    const dotGridCanvas = document.getElementById('dot-grid-canvas');
    if (dotGridCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new WireMesh(dotGridCanvas);
    }

    // Initialize other components
    new ScrollAnimations();
    new Navigation();
    new CounterAnimation();
    new ContactForm();
});

// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-base', '0.01ms');
    document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}
