/**
 * Data Scientist Portfolio - Main JavaScript
 * Features: Particle System, Scroll Animations, Navigation, Interactions
 */

// ========================================
// PARTICLE SYSTEM (Neural Network Effect)
// ========================================
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    this.isVisible = true;

    // Configuration
    this.config = {
      particleCount: 80,
      particleSize: { min: 1, max: 3 },
      particleSpeed: 0.3,
      connectionDistance: 150,
      colors: {
        particle: '#5F9598',
        connection: 'rgba(95, 149, 152, 0.15)',
        connectionHighlight: 'rgba(95, 149, 152, 0.4)'
      }
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const { particleCount, particleSize, particleSpeed } = this.config;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.animate();
      }
    });
  }

  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.config.colors.particle;
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  drawConnections() {
    const { connectionDistance, colors } = this.config;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = colors.connection;
          this.ctx.globalAlpha = opacity * 0.5;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }

      // Mouse connections
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.particles[i].x - this.mouse.x;
        const dy = this.particles[i].y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const opacity = 1 - distance / this.mouse.radius;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = colors.connectionHighlight;
          this.ctx.globalAlpha = opacity;
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    }
  }

  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.speedX *= -1;
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.speedY *= -1;
      }

      // Mouse interaction - gentle push
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          particle.x += dx * force * 0.02;
          particle.y += dy * force * 0.02;
        }
      }
    });
  }

  animate() {
    if (!this.isVisible) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawConnections();
    this.particles.forEach(particle => this.drawParticle(particle));
    this.updateParticles();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ========================================
// SKILLS RADAR CHART
// ========================================
class SkillsRadarChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animated = false;
    this.progress = 0;

    this.config = {
      skills: [
        { name: 'Machine Learning', level: 0.9 },
        { name: 'Deep Learning', level: 0.85 },
        { name: 'Data Engineering', level: 0.8 },
        { name: 'Cloud/MLOps', level: 0.75 },
        { name: 'Programming', level: 0.95 },
        { name: 'Visualization', level: 0.7 }
      ],
      colors: {
        grid: 'rgba(95, 149, 152, 0.2)',
        fill: 'rgba(95, 149, 152, 0.3)',
        stroke: '#5F9598',
        text: '#F3F4F4',
        dots: '#5F9598'
      },
      padding: 60,
      levels: 5
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const container = this.canvas.parentElement;
    const size = Math.min(container.offsetWidth, container.offsetHeight, 500);
    this.canvas.width = size;
    this.canvas.height = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = (size - this.config.padding * 2) / 2;

    if (this.animated) {
      this.draw(1);
    }
  }

  draw(progress = 1) {
    const { skills, colors, levels } = this.config;
    const numSkills = skills.length;
    const angleStep = (Math.PI * 2) / numSkills;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (this.radius / levels) * level;
      this.ctx.beginPath();

      for (let i = 0; i <= numSkills; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = this.centerX + Math.cos(angle) * levelRadius;
        const y = this.centerY + Math.sin(angle) * levelRadius;

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.strokeStyle = colors.grid;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = colors.grid;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Draw skill data
    this.ctx.beginPath();
    for (let i = 0; i <= numSkills; i++) {
      const index = i % numSkills;
      const angle = index * angleStep - Math.PI / 2;
      const skillRadius = this.radius * skills[index].level * progress;
      const x = this.centerX + Math.cos(angle) * skillRadius;
      const y = this.centerY + Math.sin(angle) * skillRadius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fillStyle = colors.fill;
    this.ctx.fill();
    this.ctx.strokeStyle = colors.stroke;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw dots at data points
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = this.radius * skills[i].level * progress;
      const x = this.centerX + Math.cos(angle) * skillRadius;
      const y = this.centerY + Math.sin(angle) * skillRadius;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = colors.dots;
      this.ctx.fill();
    }

    // Draw labels
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.fillStyle = colors.text;
    this.ctx.textAlign = 'center';

    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = this.radius + 25;
      let x = this.centerX + Math.cos(angle) * labelRadius;
      let y = this.centerY + Math.sin(angle) * labelRadius;

      // Adjust text alignment based on position
      if (Math.cos(angle) < -0.1) {
        this.ctx.textAlign = 'right';
      } else if (Math.cos(angle) > 0.1) {
        this.ctx.textAlign = 'left';
      } else {
        this.ctx.textAlign = 'center';
      }

      if (Math.sin(angle) < -0.5) {
        y -= 5;
      } else if (Math.sin(angle) > 0.5) {
        y += 10;
      }

      this.ctx.fillText(skills[i].name, x, y);
    }
  }

  animate() {
    if (this.animated) return;
    this.animated = true;

    const duration = 1500;
    const startTime = performance.now();

    const animateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      this.progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - this.progress, 4);
      this.draw(easeOutQuart);

      if (this.progress < 1) {
        requestAnimationFrame(animateFrame);
      }
    };

    requestAnimationFrame(animateFrame);
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
// PROJECT FILTERS
// ========================================
class ProjectFilters {
  constructor() {
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.projects = document.querySelectorAll('.project-card');

    if (this.filterBtns.length && this.projects.length) {
      this.init();
    }
  }

  init() {
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.setActiveFilter(btn);
        this.filterProjects(filter);
      });
    });
  }

  setActiveFilter(activeBtn) {
    this.filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  filterProjects(filter) {
    this.projects.forEach(project => {
      const categories = project.getAttribute('data-category');

      if (filter === 'all' || categories.includes(filter)) {
        project.style.display = '';
        project.style.opacity = '0';
        project.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
          project.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          project.style.opacity = '1';
          project.style.transform = 'translateY(0)';
        });
      } else {
        project.style.opacity = '0';
        project.style.transform = 'translateY(20px)';
        setTimeout(() => {
          project.style.display = 'none';
        }, 300);
      }
    });
  }
}

// ========================================
// SKILL BARS ANIMATION
// ========================================
class SkillBarsAnimation {
  constructor() {
    this.skillBars = document.querySelectorAll('.skill-bar');
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
          this.animateBar(entry.target);
          this.animated.add(entry.target);
        }
      });
    }, observerOptions);

    this.skillBars.forEach(bar => {
      this.observer.observe(bar);
    });
  }

  animateBar(bar) {
    const level = bar.getAttribute('data-level');
    const fill = bar.querySelector('.skill-bar-fill');

    if (fill) {
      setTimeout(() => {
        fill.style.width = `${level}%`;
      }, 100);
    }
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
// SKILLS RADAR OBSERVER
// ========================================
class SkillsRadarObserver {
  constructor(radarChart) {
    this.radarChart = radarChart;
    this.init();
  }

  init() {
    const canvas = this.radarChart.canvas;
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.radarChart.animate();
          this.observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    this.observer.observe(canvas);
  }
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize particle system
  const particleCanvas = document.getElementById('particle-canvas');
  if (particleCanvas) {
    new ParticleNetwork(particleCanvas);
  }

  // Initialize skills radar chart
  const skillsRadarCanvas = document.getElementById('skills-radar');
  if (skillsRadarCanvas) {
    const radarChart = new SkillsRadarChart(skillsRadarCanvas);
    new SkillsRadarObserver(radarChart);
  }

  // Initialize other components
  new ScrollAnimations();
  new Navigation();
  new CounterAnimation();
  new ProjectFilters();
  new SkillBarsAnimation();
  new ContactForm();
});

// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition-base', '0.01ms');
  document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}
