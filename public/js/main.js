/**
 * michaelgurule.com - Main JavaScript
 * Features: Intro, Scroll Animations, Navigation, Data-driven Sections, Copy Email
 */

// ========================================
// INTRO
// Decorative overlay: fade in, hold, then the name flies (FLIP) to the hero H1.
// The head script decides whether it plays by setting html.intro-active.
// ========================================
class Intro {
    constructor() {
        this.root = document.documentElement;
        this.overlay = document.querySelector('.intro');
        this.name = document.querySelector('.intro-name');
        this.title = document.querySelector('.intro-title');
        this.target = document.querySelector('.hero-title');
        this.animations = [];
        this.skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
        this.skip = () => this.finish();

        if (!this.root.classList.contains('intro-active')) return;
        if (!this.overlay || !this.name || !this.target || window.scrollY > 0) {
            this.finish();
            return;
        }
        this.init();
    }

    init() {
        this.skipEvents.forEach(type => window.addEventListener(type, this.skip, { passive: true }));

        const fadeIn = this.overlay.getAnimations ? this.overlay.getAnimations()[0] : null;
        const faded = fadeIn ? fadeIn.finished : Promise.resolve();

        faded
            .then(() => new Promise(resolve => { this.holdTimer = setTimeout(resolve, 600); }))
            .then(() => document.fonts.ready)
            .then(() => this.fly())
            .catch(() => { }); // fadeIn.finished rejects when a skip cancels it
    }

    fly() {
        if (this.done) return;

        const from = this.name.getBoundingClientRect();
        const to = this.target.getBoundingClientRect();
        const scale = parseFloat(getComputedStyle(this.target).fontSize) /
            parseFloat(getComputedStyle(this.name).fontSize);
        const move = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`;
        const timing = { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' };

        this.root.classList.add('intro-flying');
        this.animations = [
            this.name.animate([{ transform: 'none' }, { transform: move }], timing),
            this.title.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, duration: 250 }),
            this.overlay.animate([
                { backgroundColor: getComputedStyle(this.overlay).backgroundColor, backdropFilter: 'blur(18px)', webkitBackdropFilter: 'blur(18px)' },
                { backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' }
            ], timing)
        ];

        Promise.all(this.animations.map(a => a.finished))
            .then(() => this.finish())
            .catch(() => { });
    }

    finish() {
        if (this.done) return;
        this.done = true;
        clearTimeout(this.holdTimer);
        this.skipEvents.forEach(type => window.removeEventListener(type, this.skip));
        this.animations.forEach(a => a.cancel());
        this.root.classList.remove('intro-active', 'intro-flying');
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
class ScrollAnimations {
    constructor() {
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

        this.observe(document);
    }

    // Watches .fade-in elements under root, including ones rendered later
    observe(root) {
        root.querySelectorAll('.fade-in:not(.visible)').forEach(element => {
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
        window.addEventListener('scroll', () => {
            this.updateActiveLink();
        });

        // Smooth scroll for desktop nav links; mobile menu links are handled below
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    this.scrollToSection(href);
                }
            });
        });

        if (this.navToggle && this.navMobile) {
            this.navToggle.addEventListener('click', () => {
                if (this.isMenuOpen()) this.closeMobileMenu();
                else this.openMobileMenu();
            });

            this.navMobile.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => this.onMenuLinkClick(e, link));
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen()) {
                    this.closeMobileMenu();
                    this.navToggle.focus();
                }
            });

            window.addEventListener('popstate', () => this.onPopState());

            // The toggle disappears at the laptop breakpoint, so don't leave the menu open behind it
            window.matchMedia('(min-width: 64em)').addEventListener('change', (e) => {
                if (e.matches) this.closeMobileMenu();
            });
        }
    }

    scrollToSection(href) {
        const target = document.querySelector(href);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - this.nav.offsetHeight,
                behavior: 'smooth'
            });
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

    // The open menu gets its own history entry, so the back button closes it
    // instead of leaving the site.
    isMenuOpen() {
        return this.navMobile.classList.contains('active');
    }

    setMenuState(open) {
        this.navToggle.classList.toggle('active', open);
        this.navMobile.classList.toggle('active', open);
        this.navToggle.setAttribute('aria-expanded', String(open));
        this.navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        this.navMobile.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    }

    openMobileMenu() {
        this.setMenuState(true);
        history.pushState({ navMenu: true }, '');
    }

    closeMobileMenu() {
        if (!this.isMenuOpen()) return;
        this.setMenuState(false);
        if (history.state && history.state.navMenu) history.back(); // popstate finishes any pending link
    }

    onMenuLinkClick(e, link) {
        if (link.target === '_blank') {
            this.closeMobileMenu(); // the new tab opens as usual
            return;
        }
        e.preventDefault();
        const href = link.getAttribute('href');
        if (history.state && history.state.navMenu) {
            // Pop the menu entry first, so back from the destination doesn't land on a closed menu
            this.pendingHref = href;
            this.closeMobileMenu();
        } else {
            this.setMenuState(false);
            this.follow(href);
        }
    }

    onPopState() {
        const menuEntry = Boolean(history.state && history.state.navMenu);
        if (menuEntry !== this.isMenuOpen()) this.setMenuState(menuEntry);

        if (this.pendingHref) {
            const href = this.pendingHref;
            this.pendingHref = null;
            // Wait out the history traversal; the browser restores scroll after popstate
            // and would undo a scroll or drop a navigation started inside it
            setTimeout(() => this.follow(href), 0);
        }
    }

    follow(href) {
        if (href.startsWith('#')) this.scrollToSection(href);
        else window.location.href = href;
    }
}

// ========================================
// DATA-DRIVEN SECTIONS
// Technical ecosystem (data/stack.json) and projects (data/projects.json)
// ========================================
const ARROW_PATH = 'M13.5 4.5L21 12M21 12L13.5 19.5M21 12H3';

function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function createArrow(size) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('d', ARROW_PATH);
    svg.appendChild(path);
    return svg;
}

class DataSections {
    constructor(animations) {
        this.animations = animations;
        this.stack = document.querySelector('[data-stack-source]');
        this.projects = document.querySelector('[data-projects-source]');
    }

    load() {
        const jobs = [];
        if (this.stack) {
            jobs.push(this.fetchJSON(this.stack.dataset.stackSource).then(data => this.renderStack(data)));
        }
        if (this.projects) {
            jobs.push(this.fetchJSON(this.projects.dataset.projectsSource).then(data => this.renderProjects(data)));
        }
        return Promise.allSettled(jobs).then(results => {
            results.filter(r => r.status === 'rejected').forEach(r => console.error(r.reason));
            this.animations.observe(document);
            this.restoreHashPosition();
        });
    }

    fetchJSON(url) {
        return fetch(url).then(response => {
            if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
            return response.json();
        });
    }

    renderStack(data) {
        data.groups.forEach(group => {
            const category = createElement('div', 'tech-category');
            category.append(
                createElement('h4', null, group.name),
                createElement('p', null, group.items.join(', '))
            );
            this.stack.appendChild(category);
        });
    }

    renderProjects(data) {
        data.projects.forEach((project, index) => {
            const number = String(index + 1).padStart(2, '0');
            const delay = Math.min(index, 4);
            const card = createElement('article', `project-card fade-in${delay ? ` fade-in-delay-${delay}` : ''}`);
            card.dataset.reveal = 'up';

            const head = createElement('div', 'project-head');
            head.append(
                createElement('p', 'project-label', `${number} · ${project.label}`),
                createElement('h3', 'project-title', project.title)
            );
            card.appendChild(head);

            if (project.figure) {
                card.classList.add('has-figure');
                const figure = createElement('p', 'project-figure');
                figure.append(
                    this.createFigureValue(project.figure.value),
                    createElement('span', 'project-figure-caption mono-label', project.figure.caption)
                );
                card.appendChild(figure);
            }

            const body = createElement('div', 'project-body');
            project.description.forEach(paragraph => {
                body.appendChild(createElement('p', 'project-description', paragraph));
            });

            const tags = createElement('div', 'project-tags');
            project.tags.forEach(tag => tags.appendChild(createElement('span', 'tag', tag)));
            body.appendChild(tags);

            const link = createElement('a', 'project-link', 'View on GitHub');
            link.href = project.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.appendChild(createArrow(16));
            body.appendChild(link);

            card.appendChild(body);
            this.projects.appendChild(card);
        });
    }

    // Boska draws ×, +, < light and off the baseline, so set them in the body face
    createFigureValue(value) {
        const el = createElement('span', 'project-figure-value');
        value.split(/([×+<>~])/).filter(Boolean).forEach(part => {
            el.appendChild(/^[×+<>~]$/.test(part)
                ? createElement('span', 'figure-symbol', part)
                : document.createTextNode(part));
        });
        return el;
    }

    // Content above an anchored section just grew, so land on the anchor again
    restoreHashPosition() {
        if (!location.hash) return;
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ behavior: 'auto' });
    }
}

// ========================================
// COPY EMAIL
// ========================================
class CopyEmail {
    constructor() {
        this.buttons = document.querySelectorAll('.btn-copy');
        this.buttons.forEach(button => {
            button.addEventListener('click', () => this.copy(button));
        });
    }

    copy(button) {
        const status = button.parentElement.querySelector('[role="status"]');
        const text = button.dataset.copy;
        const write = navigator.clipboard && window.isSecureContext
            ? navigator.clipboard.writeText(text)
            : Promise.reject(new Error('Clipboard unavailable'));

        write.then(() => {
            button.textContent = 'Copied';
            button.classList.add('is-copied');
            if (status) status.textContent = 'Email address copied';
            clearTimeout(button.resetTimer);
            button.resetTimer = setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('is-copied');
                if (status) status.textContent = '';
            }, 2000);
        }).catch(() => {
            // Fall back to the mail client
            window.location.href = `mailto:${text}`;
        });
    }
}

// ========================================
// BIO CARD
// ========================================
// The "full story" link still points at about/. A plain click opens the same
// text in a card that grows out of the About block (the intro's fly-in, run
// the other way) and shrinks back into it on close. #bio keeps the back
// button closing the card instead of leaving the site.
class BioCard {
    constructor() {
        this.link = document.querySelector('[data-bio-open]');
        this.dialog = document.querySelector('.bio-dialog');
        if (!this.link || !this.dialog) return;

        this.source = document.querySelector('.about-content');
        this.backdrop = this.dialog.querySelector('.bio-backdrop');
        this.card = this.dialog.querySelector('.bio-card');
        this.closeButton = this.dialog.querySelector('.bio-close');
        this.body = this.dialog.querySelector('.bio-body');
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.animations = [];

        this.link.setAttribute('aria-haspopup', 'dialog');
        this.link.setAttribute('aria-controls', this.dialog.id);
        ['pointerenter', 'focus'].forEach(type => this.link.addEventListener(type, () => this.load()));
        this.link.addEventListener('click', event => this.onClick(event));
        this.closeButton.addEventListener('click', () => this.requestClose());
        this.backdrop.addEventListener('click', () => this.requestClose());
        this.dialog.addEventListener('cancel', event => {
            event.preventDefault();
            this.requestClose();
        });
        this.dialog.addEventListener('close', () => this.onClosed());
        window.addEventListener('popstate', () => this.syncWithHash());

        this.syncWithHash();
    }

    load() {
        if (!this.loading) {
            this.loading = fetch(this.link.href)
                .then(response => {
                    if (!response.ok) throw new Error(`Bio request failed: ${response.status}`);
                    return response.text();
                })
                .then(html => {
                    const article = new DOMParser().parseFromString(html, 'text/html').querySelector('.prose');
                    if (!article) throw new Error('Bio content missing');
                    const title = article.querySelector('h1');
                    if (title) title.id = 'bio-title';
                    this.body.replaceChildren(...article.childNodes);
                });
            this.loading.catch(() => { this.loading = null; });
        }
        return this.loading;
    }

    onClick(event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (this.isOpen) return;

        this.load()
            .then(() => {
                history.pushState({ bio: true }, '', '#bio');
                this.open();
            })
            .catch(() => { window.location.href = this.link.href; });
    }

    // Back, forward, and a direct visit to #bio all land here
    syncWithHash() {
        const wantsOpen = location.hash === '#bio';
        if (wantsOpen && !this.isOpen) {
            this.load().then(() => this.open()).catch(() => { });
        } else if (!wantsOpen && this.isOpen) {
            this.close();
        }
    }

    requestClose() {
        if (!this.isOpen) return;
        if (history.state && history.state.bio) {
            history.back(); // popstate closes the card
        } else {
            history.replaceState(null, '', location.pathname + location.search);
            this.close();
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        if (!this.dialog.open) {
            this.returnFocus = document.activeElement;
            const root = document.documentElement;
            root.style.setProperty('--scrollbar-gap', `${window.innerWidth - root.clientWidth}px`);
            root.classList.add('bio-open');
            this.dialog.showModal();
            this.body.scrollTop = 0;
        }
        this.morph(true);
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        this.morph(false).then(() => {
            if (!this.isOpen) this.dialog.close(); // unless reopened mid-close
        });
    }

    // Runs however the dialog ended up closed, including a browser-forced close
    onClosed() {
        this.isOpen = false;
        this.animations.forEach(animation => animation.cancel());
        document.documentElement.classList.remove('bio-open');
        if (location.hash === '#bio') history.replaceState(null, '', location.pathname + location.search);
        if (this.returnFocus) this.returnFocus.focus({ preventScroll: true });
    }

    // Keyframes are written for opening; closing plays the same frames backwards
    // so the ease-out still lands softly on the About block.
    morph(opening) {
        this.animations.forEach(animation => animation.cancel());

        const reduced = this.reducedMotion.matches || !this.source;
        const timing = {
            duration: reduced ? 160 : (opening ? 560 : 440),
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both'
        };
        const fade = [{ opacity: 0 }, { opacity: 1 }];
        let cardFrames = fade;
        let contentFrames = fade;

        if (!reduced) {
            const from = this.source.getBoundingClientRect();
            const to = this.card.getBoundingClientRect();
            const collapsed = `translate(${from.left - to.left}px, ${from.top - to.top}px) ` +
                `scale(${from.width / to.width}, ${from.height / to.height})`;
            cardFrames = [
                { transform: collapsed, opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { transform: 'none', opacity: 1 }
            ];
            // Text stays hidden until the card has nearly finished stretching
            contentFrames = [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }];
        }

        const play = (element, frames) => element.animate(opening ? frames : reverseFrames(frames), timing);
        this.animations = [
            play(this.backdrop, fade),
            play(this.card, cardFrames),
            play(this.body, contentFrames),
            play(this.closeButton, contentFrames)
        ];

        return Promise.all(this.animations.map(animation => animation.finished)).catch(() => { });
    }
}

function reverseFrames(frames) {
    return frames.slice().reverse().map(frame =>
        'offset' in frame ? { ...frame, offset: 1 - frame.offset } : frame);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new Intro();
    const animations = new ScrollAnimations();
    new Navigation();
    new DataSections(animations).load();
    new CopyEmail();
    new BioCard();
});

// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-base', '0.01ms');
    document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}
