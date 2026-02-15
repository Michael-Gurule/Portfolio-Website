/**
 * Data Scientist Portfolio - Main JavaScript
 * Features: Particle System, Scroll Animations, Navigation, Interactions
 */

// ========================================
// NEURAL NETWORK HERO (Radiates from center)
// ========================================
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 180 };
    this.animationId = null;
    this.isVisible = true;
    this.startTime = null;
    this.burstReady = false; // waits for startBurst() call

    // Intro burst: nodes travel from center to final positions over this duration
    this.burstDuration = 2200; // ms

    this.config = {
      particleCount: 90,
      connectionDistance: 160,
      drift: 0.18,          // gentle float speed after burst
      nodeMinR: 1.2,
      nodeMaxR: 3.0,
      // Teal palette (RGB)
      coreColor:  [122, 176, 179],  // bright teal — near center
      edgeColor:  [ 29,  84, 109],  // deep navy — far from center
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const cx = this.canvas.width  / 2;
    const cy = this.canvas.height / 2;
    const { particleCount, nodeMinR, nodeMaxR, drift } = this.config;

    // Spread radius — fill most of the viewport
    const maxR = Math.max(this.canvas.width, this.canvas.height) * 0.56;

    for (let i = 0; i < particleCount; i++) {
      // Final resting position: random angle, bias toward mid-range radii
      const angle  = Math.random() * Math.PI * 2;
      const r      = maxR * (0.15 + Math.random() * 0.85);
      const tx     = cx + Math.cos(angle) * r;
      const ty     = cy + Math.sin(angle) * r;

      // Normalised distance from center (0 = center, 1 = edge)
      const normDist = r / maxR;

      this.particles.push({
        // Current position starts at center
        x: cx, y: cy,
        // Target position
        tx, ty,
        size:   nodeMinR + Math.random() * (nodeMaxR - nodeMinR),
        normDist,                    // for colour blending
        // Continuous drift after burst settles
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: (0.4 + Math.random() * 0.6) * drift,
        driftRadius: 6 + Math.random() * 18,
        // Store drift origin (set once burst is done)
        ox: null, oy: null,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
      this.startTime = null; // restart burst on resize
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
      }
    });
  }

  // Ease-out expo for the burst
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  update(timestamp) {
    if (!this.startTime) this.startTime = timestamp ?? performance.now();
    const elapsed = (timestamp ?? this.startTime) - this.startTime;
    const burstT  = Math.min(elapsed / this.burstDuration, 1);
    const burstDone = burstT >= 1;

    const cx = this.canvas.width  / 2;
    const cy = this.canvas.height / 2;

    this.particles.forEach(p => {
      if (!burstDone) {
        // Stagger each node's departure slightly for organic feel
        const delay    = p.normDist * 0.25;          // 0–0.25 normalised offset
        const localT   = Math.max(0, (burstT - delay) / (1 - delay));
        const eased    = this.easeOutExpo(Math.min(localT, 1));
        p.x = cx + (p.tx - cx) * eased;
        p.y = cy + (p.ty - cy) * eased;
        if (eased >= 1 && p.ox === null) {
          p.ox = p.tx; p.oy = p.ty;
        }
      } else {
        // Settle origin on first fully-done frame
        if (p.ox === null) { p.ox = p.tx; p.oy = p.ty; }

        // Gentle continuous float
        p.driftAngle += 0.004;
        p.x = p.ox + Math.cos(p.driftAngle) * p.driftRadius * p.driftSpeed;
        p.y = p.oy + Math.sin(p.driftAngle) * p.driftRadius * p.driftSpeed;

        // Soft mouse repulsion
        if (this.mouse.x !== null) {
          const dx   = p.x - this.mouse.x;
          const dy   = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.mouse.radius) {
            const force = (this.mouse.radius - dist) / this.mouse.radius;
            p.x += dx * force * 0.025;
            p.y += dy * force * 0.025;
          }
        }
      }
    });

    return burstT; // used for fade-in of lines
  }

  draw(burstT) {
    const { ctx, canvas } = this;
    const { connectionDistance, coreColor, edgeColor } = this.config;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lines fade in during last 60% of burst
    const lineAlpha = Math.min(1, Math.max(0, (burstT - 0.4) / 0.6));

    // Draw connections
    if (lineAlpha > 0) {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const pi = this.particles[i];
          const pj = this.particles[j];
          const dx   = pi.x - pj.x;
          const dy   = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const proximity  = 1 - dist / connectionDistance;
            const avgNorm    = (pi.normDist + pj.normDist) * 0.5;
            const baseOpacity = 0.06 + proximity * 0.28;
            const alpha       = baseOpacity * lineAlpha;

            // Mouse highlight
            let boost = 1;
            if (this.mouse.x !== null) {
              const midX = (pi.x + pj.x) * 0.5 - this.mouse.x;
              const midY = (pi.y + pj.y) * 0.5 - this.mouse.y;
              const mdist = Math.sqrt(midX * midX + midY * midY);
              boost = mdist < this.mouse.radius
                ? 1 + (1 - mdist / this.mouse.radius) * 2.5
                : 1;
            }

            const [r, g, b] = blendToCenter(avgNorm);
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(alpha * boost, 0.7)})`;
            ctx.lineWidth = 0.8 + proximity * 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Draw nodes
    this.particles.forEach(p => {
      const [r, g, b] = blendToCenter(p.normDist);
      const nodeAlpha = (0.55 + (1 - p.normDist) * 0.45) * Math.max(lineAlpha, burstT * 1.5);

      // Mouse glow on nodes
      let glowBoost = 1;
      if (this.mouse.x !== null) {
        const dx   = p.x - this.mouse.x;
        const dy   = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) glowBoost = 1 + (1 - dist / this.mouse.radius) * 1.8;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * glowBoost, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(nodeAlpha, 1)})`;
      ctx.fill();
    });

    // Helper: blend core→edge colour based on normalised distance
    function blendToCenter(norm) {
      const t = Math.min(norm, 1);
      return [
        Math.round(coreColor[0] + (edgeColor[0] - coreColor[0]) * t),
        Math.round(coreColor[1] + (edgeColor[1] - coreColor[1]) * t),
        Math.round(coreColor[2] + (edgeColor[2] - coreColor[2]) * t),
      ];
    }
  }

  animate(timestamp) {
    if (!this.isVisible) return;
    if (!this.burstReady) {
      // Waiting for splash to clear — just keep the loop alive, draw nothing
      this.animationId = requestAnimationFrame((ts) => this.animate(ts));
      return;
    }
    const burstT = this.update(timestamp);
    this.draw(burstT);
    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }

  // Call this to trigger the burst animation (fired when splash clears)
  startBurst() {
    this.burstReady = true;
    this.startTime = null;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.particles.forEach(p => {
      p.x = cx; p.y = cy;
      p.ox = null; p.oy = null;
    });
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ========================================
// DOT GRID BACKGROUND
// ========================================
class DotGrid {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mouse = { x: -9999, y: -9999 };
    this.target = { x: -9999, y: -9999 };
    this.animationId = null;
    this.isVisible = !document.hidden;

    this.config = {
      spacing: 32,
      dotRadius: 1.2,
      revealRadius: 200,
      baseOpacity: 0.06,
      peakOpacity: 0.55,
      baseColor: [95, 149, 152],   // --color-accent RGB
      glowColor: [122, 176, 179],  // --color-accent-light RGB
      lerpSpeed: 0.1
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

    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.target.x = -9999;
      this.target.y = -9999;
    });

    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) this.animate();
    });
  }

  draw() {
    const { spacing, dotRadius, revealRadius, baseOpacity, peakOpacity, baseColor, glowColor } = this.config;
    const { ctx, canvas, mouse } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cols = Math.ceil(canvas.width / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing;
        const y = row * spacing;

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / revealRadius);
        const eased = proximity * proximity * (3 - 2 * proximity); // smoothstep

        const opacity = baseOpacity + (peakOpacity - baseOpacity) * eased;
        const r = Math.round(baseColor[0] + (glowColor[0] - baseColor[0]) * eased);
        const g = Math.round(baseColor[1] + (glowColor[1] - baseColor[1]) * eased);
        const b = Math.round(baseColor[2] + (glowColor[2] - baseColor[2]) * eased);
        const radius = dotRadius + eased * 0.8;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      }
    }
  }

  animate() {
    if (!this.isVisible) return;

    // Lerp mouse toward target for smooth follow
    this.mouse.x += (this.target.x - this.mouse.x) * this.config.lerpSpeed;
    this.mouse.y += (this.target.y - this.mouse.y) * this.config.lerpSpeed;

    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
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
  // Initialize particle system early so the canvas is ready (but burst fires on splash clear)
  const particleCanvas = document.getElementById('particle-canvas');
  let particleNetwork = null;
  if (particleCanvas) {
    particleNetwork = new ParticleNetwork(particleCanvas);
  }

  // Intro splash
  const splash = document.getElementById('intro-splash');
  const heroContent = document.querySelector('.hero-content');
  if (splash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      splash.addEventListener('transitionend', () => {
        splash.remove();
        if (heroContent) heroContent.classList.add('hero-visible');
        // Fire the neural network burst now that the hero is revealed
        if (particleNetwork) particleNetwork.startBurst();
      }, { once: true });
    }, 1800);
  } else {
    if (splash) splash.remove();
    if (heroContent) heroContent.classList.add('hero-visible');
    // No splash — burst immediately
    if (particleNetwork) particleNetwork.startBurst();
  }

  // Initialize dot grid background
  const dotGridCanvas = document.getElementById('dot-grid-canvas');
  if (dotGridCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    new DotGrid(dotGridCanvas);
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
