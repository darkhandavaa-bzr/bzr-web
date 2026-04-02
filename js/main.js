/* ============================================
   Fluid Glass — JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  const state = {
    isTouch: false,
    menuOpen: false,
    quoteOpen: false,
    introComplete: false,
    currentReview: 0,
    totalReviews: 0,
    videoPlaying: false,
    videoMuted: true,
  };

  // --- DOM Elements ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const els = {};

  function cacheElements() {
    els.cursor = $('#cursor');
    els.cursorLabel = $('#cursorLabel');
    els.intro = $('#intro');
    els.header = $('#header');
    els.menuToggle = $('#menuToggle');
    els.menuOverlay = $('#menuOverlay');
    els.menuLinks = $$('.menu-link');
    els.quoteBtn = $('#quoteBtn');
    els.ctaQuoteBtn = $('#ctaQuoteBtn');
    els.quotePanel = $('#quotePanel');
    els.quotePanelBg = $('#quotePanelBg');
    els.quoteClose = $('#quoteClose');
    els.quoteForm = $('#quoteForm');
    els.quoteSuccess = $('#quoteSuccess');
    els.quoteSubmit = $('#quoteSubmit');
    els.reviewsTrack = $('#reviewsTrack');
    els.reviewPrev = $('#reviewPrev');
    els.reviewNext = $('#reviewNext');
    els.reviewCurrent = $('#reviewCurrent');
    els.reviewTotal = $('#reviewTotal');
    els.reviewCards = $$('.review-card');
    els.animElements = $$('.anim-reveal');
    els.navLinks = $$('.nav-link');
    els.cursorTargets = $$('[data-cursor]');
  }

  // --- Touch Detection ---
  function detectTouch() {
    window.addEventListener('touchstart', function onTouch() {
      state.isTouch = true;
      document.body.classList.add('is-touch');
      window.removeEventListener('touchstart', onTouch);
    }, { passive: true });
  }

  // --- Custom Cursor ---
  function initCursor() {
    if (state.isTouch) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      els.cursor.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => {
      els.cursor.classList.remove('visible');
    });

    // Hover targets with labels
    els.cursorTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        els.cursor.classList.add('active');
        els.cursorLabel.textContent = el.dataset.cursor;
      });
      el.addEventListener('mouseleave', () => {
        els.cursor.classList.remove('active');
        els.cursorLabel.textContent = '';
      });
    });

    // Animation loop
    function updateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      els.cursor.style.left = cursorX + 'px';
      els.cursor.style.top = cursorY + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();
  }

  // --- Intro Animation ---
  function initIntro() {
    setTimeout(() => {
      els.intro.classList.add('hidden');
      state.introComplete = true;
      setTimeout(() => {
        els.intro.style.display = 'none';
      }, 600);
    }, 2000);
  }

  // --- Header Scroll ---
  function initHeaderScroll() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            els.header.classList.add('scrolled');
          } else {
            els.header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Mobile Menu ---
  function initMenu() {
    els.menuToggle.addEventListener('click', toggleMenu);

    els.menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (state.menuOpen) toggleMenu();
      });
    });
  }

  function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    els.menuToggle.classList.toggle('active', state.menuOpen);
    els.menuOverlay.classList.toggle('open', state.menuOpen);
    document.body.classList.toggle('no-scroll', state.menuOpen);
  }

  // --- Quote Panel ---
  function initQuotePanel() {
    const openQuote = () => {
      state.quoteOpen = true;
      els.quotePanel.classList.add('open');
      document.body.classList.add('no-scroll');
    };

    const closeQuote = () => {
      state.quoteOpen = false;
      els.quotePanel.classList.remove('open');
      document.body.classList.remove('no-scroll');
    };

    els.quoteBtn.addEventListener('click', openQuote);
    els.ctaQuoteBtn.addEventListener('click', openQuote);
    els.quoteClose.addEventListener('click', closeQuote);
    els.quotePanelBg.addEventListener('click', closeQuote);

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.quoteOpen) closeQuote();
        if (state.menuOpen) toggleMenu();
      }
    });

    // Form submission
    els.quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot check
      const honeypot = els.quoteForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) return;

      // Show success
      els.quoteForm.style.display = 'none';
      els.quoteSuccess.style.display = 'flex';

      // Reset after delay
      setTimeout(() => {
        els.quoteForm.reset();
        els.quoteForm.style.display = '';
        els.quoteSuccess.style.display = 'none';
        closeQuote();
      }, 3000);
    });
  }

  // --- Reviews Carousel ---
  function initReviews() {
    state.totalReviews = els.reviewCards.length;
    els.reviewTotal.textContent = state.totalReviews;

    function goToReview(index) {
      state.currentReview = index;
      els.reviewsTrack.style.transform = `translateX(-${index * 100}%)`;
      els.reviewCurrent.textContent = index + 1;
    }

    els.reviewNext.addEventListener('click', () => {
      const next = (state.currentReview + 1) % state.totalReviews;
      goToReview(next);
    });

    els.reviewPrev.addEventListener('click', () => {
      const prev = (state.currentReview - 1 + state.totalReviews) % state.totalReviews;
      goToReview(prev);
    });

    // Auto-advance
    let autoPlay = setInterval(() => {
      const next = (state.currentReview + 1) % state.totalReviews;
      goToReview(next);
    }, 6000);

    // Pause on hover
    const carousel = $('#reviewsCarousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carousel.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        const next = (state.currentReview + 1) % state.totalReviews;
        goToReview(next);
      }, 6000);
    });

    // Touch swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          els.reviewNext.click();
        } else {
          els.reviewPrev.click();
        }
      }
    }, { passive: true });
  }

  // --- Scroll Reveal Animations ---
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    els.animElements.forEach(el => observer.observe(el));
  }

  // --- Smooth Scroll for Nav Links ---
  // Custom smooth scroll with configurable duration
  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + diff * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initSmoothScroll() {
    const allLinks = [...els.navLinks, ...els.menuLinks, ...$$('a[href^="#"]')];
    const seen = new Set();

    allLinks.forEach(link => {
      if (seen.has(link)) return;
      seen.add(link);

      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const headerOffset = 100;
            const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
            smoothScrollTo(top, 2000);
          }
        }
      });
    });
  }

  // --- Active Nav on Scroll ---
  function initActiveNav() {
    const sections = $$('section[id]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          els.navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === '#' + id
              ? 'var(--color-white)'
              : '';
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(sec => observer.observe(sec));
  }

  // --- Keyboard Navigation ---
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Left/Right arrows for reviews
      if (!state.quoteOpen && !state.menuOpen) {
        if (e.key === 'ArrowRight') els.reviewNext.click();
        if (e.key === 'ArrowLeft') els.reviewPrev.click();
      }
    });
  }

  // --- Init ---
  function init() {
    cacheElements();
    detectTouch();
    initCursor();
    initIntro();
    initHeaderScroll();
    initMenu();
    initQuotePanel();
    initReviews();
    initScrollAnimations();
    initSmoothScroll();
    initActiveNav();
    initKeyboard();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
