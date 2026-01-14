/* ==========================================================================
   Share Bar & Series Navigation
   ========================================================================== */

(function() {
  'use strict';

  // Elements
  const shareBarDesktop = document.getElementById('shareBarDesktop');
  const shareBarMobile = document.getElementById('shareBarMobile');
  const seriesNavDesktop = document.getElementById('seriesNavDesktop');
  const seriesNavMobile = document.getElementById('seriesNavMobile');
  const postContent = document.getElementById('postContent');
  
  const progressRingDesktop = document.getElementById('progressRingDesktop');
  const progressRingMobile = document.getElementById('progressRingMobile');

  if (!postContent) return;

  // Constants
  const CIRCUMFERENCE_DESKTOP = 2 * Math.PI * 16;
  const CIRCUMFERENCE_MOBILE = 2 * Math.PI * 20;
  const SHOW_THRESHOLD = 300;

  // Store scroll position for iOS
  let scrollPosition = 0;

  // Initialize progress rings
  function initProgressRings() {
    if (progressRingDesktop) {
      progressRingDesktop.style.strokeDasharray = CIRCUMFERENCE_DESKTOP;
      progressRingDesktop.style.strokeDashoffset = CIRCUMFERENCE_DESKTOP;
    }
    
    if (progressRingMobile) {
      progressRingMobile.style.strokeDasharray = CIRCUMFERENCE_MOBILE;
      progressRingMobile.style.strokeDashoffset = CIRCUMFERENCE_MOBILE;
    }
  }

  // Update reading progress
  function updateProgress() {
    const postRect = postContent.getBoundingClientRect();
    const postTop = postRect.top + window.scrollY;
    const postHeight = postContent.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const start = postTop - windowHeight;
    const end = postTop + postHeight - windowHeight;
    const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);

    // Update progress rings
    if (progressRingDesktop) {
      const offsetDesktop = CIRCUMFERENCE_DESKTOP - (progress * CIRCUMFERENCE_DESKTOP);
      progressRingDesktop.style.strokeDashoffset = offsetDesktop;
    }
    
    if (progressRingMobile) {
      const offsetMobile = CIRCUMFERENCE_MOBILE - (progress * CIRCUMFERENCE_MOBILE);
      progressRingMobile.style.strokeDashoffset = offsetMobile;
    }

    // Show/hide share bars
    const shouldShow = scrollY > SHOW_THRESHOLD;
    
    [shareBarDesktop, shareBarMobile].forEach(bar => {
      if (bar) bar.classList.toggle('is-visible', shouldShow);
    });
  }

  // Prevent body scroll (for mobile)
  function disableBodyScroll() {
    scrollPosition = window.scrollY;
    document.body.classList.add('series-nav-open');
    document.body.style.top = `-${scrollPosition}px`;
  }

  // Enable body scroll (for mobile)
  function enableBodyScroll() {
    document.body.classList.remove('series-nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  }

  // Toggle series navigation
  function toggleSeriesNav() {
    const isMobile = window.innerWidth <= 768;
    const nav = isMobile ? seriesNavMobile : seriesNavDesktop;
    const toggleBtns = document.querySelectorAll('.js-series-toggle');
    
    if (!nav) return;

    const isOpen = nav.classList.contains('is-open');
    
    // Toggle open state
    nav.classList.toggle('is-open');
    
    // Toggle button active state
    toggleBtns.forEach(btn => btn.classList.toggle('is-active', !isOpen));
    
    // Handle body scroll
    if (isOpen) {
      // Closing - restore scroll
      if (isMobile) {
        enableBodyScroll();
      } else {
        document.body.style.overflow = '';
      }
    } else {
      // Opening - prevent scroll
      if (isMobile) {
        disableBodyScroll();
      } else {
        document.body.style.overflow = 'hidden';
      }
    }
  }

  // Close series navigation
  function closeSeriesNav() {
    [seriesNavDesktop, seriesNavMobile].forEach(nav => {
      if (nav) nav.classList.remove('is-open');
    });
    
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.classList.remove('is-active');
    });
    
    // Restore scroll for both
    enableBodyScroll();
    document.body.style.overflow = '';
  }

  // Handle resize
  function handleResize() {
    const wasOpen = document.querySelector('.series-nav.is-open');
    if (wasOpen) {
      closeSeriesNav();
    }
  }

  // Event listeners
  function initEventListeners() {
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.addEventListener('click', toggleSeriesNav);
    });
    
    document.querySelectorAll('.js-series-close').forEach(btn => {
      btn.addEventListener('click', closeSeriesNav);
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeSeriesNav();
    });

    window.addEventListener('resize', handleResize);
  }

  // Initialize
  initProgressRings();
  initEventListeners();
  updateProgress();

})();