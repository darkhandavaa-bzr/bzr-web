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
    els.filterBtns = $$('.filter-btn');
    els.productCards = $$('.product-card');
    els.reviewsTrack = $('#reviewsTrack');
    els.reviewPrev = $('#reviewPrev');
    els.reviewNext = $('#reviewNext');
    els.reviewCurrent = $('#reviewCurrent');
    els.reviewTotal = $('#reviewTotal');
    els.reviewCards = $$('.review-card');
    els.videoPlayer = $('#videoPlayer');
    els.video = $('#showroomVideo');
    els.videoOverlay = $('#videoOverlay');
    els.videoPlayBtn = $('#videoPlayBtn');
    els.videoToggle = $('#videoToggle');
    els.videoRange = $('#videoRange');
    els.videoProgress = $('#videoProgress');
    els.videoTime = $('#videoTime');
    els.videoMute = $('#videoMute');
    els.fileUpload = $('#fileUpload');
    els.fileInput = $('#qFiles');
    els.fileList = $('#fileList');
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
        els.fileList.innerHTML = '';
        els.quoteForm.style.display = '';
        els.quoteSuccess.style.display = 'none';
        closeQuote();
      }, 3000);
    });
  }

  // --- File Upload ---
  function initFileUpload() {
    let uploadedFiles = [];

    els.fileInput.addEventListener('change', (e) => {
      const newFiles = Array.from(e.target.files);
      uploadedFiles = [...uploadedFiles, ...newFiles];
      renderFileList();
    });

    // Drag and drop
    els.fileUpload.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.fileUpload.style.borderColor = 'var(--color-black)';
      els.fileUpload.style.background = 'rgba(255,255,255,0.5)';
    });

    els.fileUpload.addEventListener('dragleave', () => {
      els.fileUpload.style.borderColor = '';
      els.fileUpload.style.background = '';
    });

    els.fileUpload.addEventListener('drop', (e) => {
      e.preventDefault();
      els.fileUpload.style.borderColor = '';
      els.fileUpload.style.background = '';
      const droppedFiles = Array.from(e.dataTransfer.files);
      uploadedFiles = [...uploadedFiles, ...droppedFiles];
      renderFileList();
    });

    function renderFileList() {
      els.fileList.innerHTML = uploadedFiles.map((file, i) => `
        <div class="file-item">
          <span>${file.name} (${formatSize(file.size)})</span>
          <button class="file-remove" data-index="${i}" type="button">&times;</button>
        </div>
      `).join('');

      // Remove file handlers
      els.fileList.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          uploadedFiles.splice(idx, 1);
          renderFileList();
        });
      });
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  }

  // --- Product Filtering ---
  function initFilters() {
    els.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        els.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter products
        els.productCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hidden');
            card.style.opacity = '0';
            card.style.transform = 'translateY(2rem)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s, transform 0.4s';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.classList.add('hidden');
          }
        });
      });
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

  // --- Video Player ---
  function initVideoPlayer() {
    const video = els.video;
    const iconPlay = els.videoToggle.querySelector('.icon-play');
    const iconPause = els.videoToggle.querySelector('.icon-pause');
    const iconUnmuted = els.videoMute.querySelector('.icon-unmuted');
    const iconMuted = els.videoMute.querySelector('.icon-muted');

    function togglePlay() {
      if (video.paused) {
        video.play();
        state.videoPlaying = true;
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        els.videoOverlay.classList.add('hidden');
      } else {
        video.pause();
        state.videoPlaying = false;
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
      }
    }

    function toggleMute() {
      video.muted = !video.muted;
      state.videoMuted = video.muted;
      iconUnmuted.style.display = video.muted ? 'none' : 'block';
      iconMuted.style.display = video.muted ? 'block' : 'none';
    }

    function formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updateProgress() {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        els.videoProgress.style.width = pct + '%';
        els.videoRange.value = pct;
        els.videoTime.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      }
    }

    els.videoPlayBtn.addEventListener('click', togglePlay);
    els.videoOverlay.addEventListener('click', togglePlay);
    els.videoToggle.addEventListener('click', togglePlay);
    els.videoMute.addEventListener('click', toggleMute);

    video.addEventListener('timeupdate', updateProgress);

    video.addEventListener('ended', () => {
      state.videoPlaying = false;
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      els.videoOverlay.classList.remove('hidden');
    });

    els.videoRange.addEventListener('input', (e) => {
      const time = (e.target.value / 100) * video.duration;
      video.currentTime = time;
    });
  }

  // --- Scroll Reveal Animations ---
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay based on element index within viewport batch
          const delay = i * 80;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
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
            window.scrollTo({ top, behavior: 'smooth' });
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

  // --- Lazy load videos ---
  function initHeroVideo() {
    const heroVideo = document.getElementById('heroVideo');
    const showroomVideo = document.getElementById('showroomVideo');
    setTimeout(() => {
      if (heroVideo) {
        heroVideo.innerHTML = '<source src="https://assets.mixkit.co/videos/1168/1168-720.mp4" type="video/mp4">';
        heroVideo.load();
        heroVideo.play().catch(() => {});
      }
      if (showroomVideo) {
        showroomVideo.innerHTML = '<source src="https://assets.mixkit.co/videos/4881/4881-720.mp4" type="video/mp4">';
        showroomVideo.load();
      }
    }, 3000);
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
    initFileUpload();
    initFilters();
    initReviews();
    initVideoPlayer();
    initScrollAnimations();
    initSmoothScroll();
    initActiveNav();
    initKeyboard();
    initHeroVideo();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
